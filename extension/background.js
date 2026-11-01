// LarunaMave Video Watcher — background service worker.
// Periodically (while the user's Chrome is running) re-reads the two PH list pages
// the user already browses, using the user's OWN real browser session — not a
// server-side bot. Diffs against what's already published and, if anything changed,
// pushes updated videos.json / tags_overrides.json straight to GitHub via the
// Contents API. A separate GitHub Actions workflow (rebuild-on-data-change.yml)
// picks up that push and regenerates the HTML — PH is never touched from CI.
import { parseListPage, parseVideoPage, relativeToIsoDate } from './parse.js';
import { ghGetJson, ghPutJson, ghGetFile, ghPutFile } from './github.js';

const RECENT_URL = 'https://www.pornhub.com/pornstar/larunamave/videos/upload?o=mr';
const VIEWED_URL = 'https://www.pornhub.com/pornstar/larunamave/videos/upload?o=mv';
const TOP20_REFRESH_DAYS = 30; // "раз в месяц" per spec
const ALARM_NAME = 'larunamave-check';

async function getConfig() {
  const { config } = await chrome.storage.local.get('config');
  return config || null;
}

async function log(line) {
  const { logs = [] } = await chrome.storage.local.get('logs');
  logs.unshift(`[${new Date().toISOString()}] ${line}`);
  await chrome.storage.local.set({ logs: logs.slice(0, 100) });
  console.log('[LarunaMave Watcher]', line);
}

async function setStatus(status) {
  await chrome.storage.local.set({ status, lastRun: new Date().toISOString() });
}

async function fetchText(url) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`Fetch ${url} failed: ${res.status}`);
  return res.text();
}

function blobToBase64(blob) {
  return blob.arrayBuffer().then((buf) => {
    const bytes = new Uint8Array(buf);
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  });
}

// PH's own thumbnail CDN links are signed and expire within ~24h (that's what was
// breaking the thumbnail grids whenever a rebuild didn't happen same-day). Instead
// of hotlinking PH's URL, fetch the image once while the link is still good and
// store a permanent copy in the repo — same mechanism as the blog photo upload.
// Returns our own stable path, or the original URL if the fetch/upload failed.
async function cacheThumbnail(cfg, vkey, url) {
  if (!url) return url;
  const path = `assets/thumbs/${vkey}.jpg`;
  try {
    const { sha } = await ghGetFile(cfg, path);
    if (sha) return `/${path}`; // already cached
    const res = await fetch(url);
    if (!res.ok) return url;
    const base64 = await blobToBase64(await res.blob());
    await ghPutFile(cfg, path, base64, null, `Cache thumbnail: ${vkey}`);
    return `/${path}`;
  } catch (e) {
    return url; // fall back to the live PH link rather than fail the whole run
  }
}

async function notify(title, message) {
  try {
    await chrome.notifications.create({ type: 'basic', iconUrl: 'icon128.png', title, message });
  } catch { /* notifications permission optional */ }
}

async function runCheck({ force = false } = {}) {
  const cfg = await getConfig();
  if (!cfg || !cfg.owner || !cfg.repo || !cfg.pat) {
    await log('Not configured yet — open the extension options.');
    await setStatus('not-configured');
    return;
  }

  await setStatus('checking');
  await log('Check started.');

  try {
    const [recentVideos, { json: videosJson, sha: videosSha }, { json: tagsOverrides, sha: tagsSha }] = await Promise.all([
      fetchText(RECENT_URL).then(parseListPage),
      ghGetJson(cfg, 'videos.json'),
      ghGetJson(cfg, 'tags_overrides.json'),
    ]);
    await log(`Fetched recent list: ${recentVideos.length} videos.`);

    const { lastTop20Check = 0 } = await chrome.storage.local.get('lastTop20Check');
    const dueForTop20 = force || Date.now() - lastTop20Check > TOP20_REFRESH_DAYS * 86400000;
    let viewedVideos = (videosJson?.top20_by_views || []);
    if (dueForTop20) {
      viewedVideos = parseListPage(await fetchText(VIEWED_URL));
      await log(`Fetched most-viewed list (monthly refresh): ${viewedVideos.length} videos.`);
      await chrome.storage.local.set({ lastTop20Check: Date.now() });
    }

    const today = new Date().toISOString().slice(0, 10);
    const byKey = new Map();
    for (const v of viewedVideos) byKey.set(v.vkey, { ...v });
    for (const v of recentVideos) {
      const existing = byKey.get(v.vkey);
      if (existing) existing.added_relative ??= v.added_relative;
      else byKey.set(v.vkey, { ...v });
    }

    const overrides = { ...(tagsOverrides || {}) };
    const latestKeys = recentVideos.slice(0, 5).map((v) => v.vkey);
    const topKeys = viewedVideos.slice(0, 20).map((v) => v.vkey);
    const published = [...new Set([...latestKeys, ...topKeys])];

    let newVideoFound = null;
    const oldLatestKeys = new Set((videosJson?.latest || []).map((v) => v.vkey));
    for (const k of latestKeys) if (!oldLatestKeys.has(k)) newVideoFound = byKey.get(k);

    let tagFetches = 0;
    let thumbsCached = 0;
    for (const vkey of published) {
      const v = byKey.get(vkey);
      if (!overrides[vkey]) {
        try {
          const html = await fetchText(`https://www.pornhub.com/view_video.php?viewkey=${vkey}`);
          const parsed = parseVideoPage(html);
          if (parsed?.tags?.length) {
            overrides[vkey] = parsed.tags;
            tagFetches++;
          }
          await new Promise((r) => setTimeout(r, 800)); // don't hammer, nothing to hide — just polite
        } catch (e) {
          await log(`Tag fetch failed for ${vkey}: ${e.message}`);
        }
      }
      if (v && v.thumbnail && !v.thumbnail.startsWith('/assets/thumbs/')) {
        const cached = await cacheThumbnail(cfg, vkey, v.thumbnail);
        if (cached !== v.thumbnail) { v.thumbnail = cached; thumbsCached++; }
      }
    }
    if (tagFetches) await log(`Fetched real tags for ${tagFetches} video(s).`);
    if (thumbsCached) await log(`Cached ${thumbsCached} thumbnail(s) locally (won't expire now).`);

    for (const v of byKey.values()) {
      v.upload_date = relativeToIsoDate(v.added_relative, today);
      if (overrides[v.vkey]) { v.tags = overrides[v.vkey]; v.tags_source = 'ph_page'; }
      else { v.tags_source = 'title_heuristic'; }
    }

    const newVideosJson = {
      last_updated: new Date().toISOString(),
      source: 'extension (background, user\'s own browser session)',
      latest: latestKeys.map((k) => byKey.get(k)),
      top20_by_views: topKeys.map((k) => byKey.get(k)),
      all_videos: [...byKey.values()],
    };

    const videosChanged = JSON.stringify(newVideosJson.latest) !== JSON.stringify(videosJson?.latest)
      || JSON.stringify(newVideosJson.top20_by_views) !== JSON.stringify(videosJson?.top20_by_views);
    const tagsChanged = JSON.stringify(overrides) !== JSON.stringify(tagsOverrides || {});

    if (videosChanged) {
      await ghPutJson(cfg, 'videos.json', newVideosJson, videosSha, 'Extension: update videos.json');
      await log('Pushed updated videos.json.');
    }
    if (tagsChanged) {
      await ghPutJson(cfg, 'tags_overrides.json', overrides, tagsSha, 'Extension: update tags_overrides.json');
      await log('Pushed updated tags_overrides.json.');
    }
    if (!videosChanged && !tagsChanged) {
      await log('No changes.');
    }
    if (newVideoFound) {
      await notify('New LarunaMave video found', newVideoFound.title);
    }

    await setStatus('ok');
  } catch (e) {
    await log(`ERROR: ${e.message}`);
    await setStatus('error');
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const { intervalMinutes = 1440 } = (await chrome.storage.local.get('config'))?.config || {};
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: intervalMinutes, delayInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) runCheck();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === 'check-now') {
    runCheck({ force: msg.force }).then(() => sendResponse({ ok: true }));
    return true; // keep channel open for async response
  }
  if (msg?.type === 'reschedule') {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: msg.intervalMinutes, delayInMinutes: 1 });
    sendResponse({ ok: true });
  }
});
