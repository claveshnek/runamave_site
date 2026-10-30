// Live PornHub scraper — the automated replacement for "save HTML by hand + run
// build_videos_json.mjs / parse_video_page.mjs". Visits the model's video list
// (most recent + most viewed) and the page of every published video (top20 +
// latest5) to pull real tags, using a real headless browser (Playwright) since
// PH serves a different/challenge page to plain fetch() requests from datacenter IPs.
//
// Run: node scrape_ph.mjs
// Requires: npm install (installs playwright), then `npx playwright install chromium`.
//
// Used by .github/workflows/daily-videos.yml. Can also be run locally, but this
// is exactly the kind of outbound request that may be blocked from a sandboxed
// dev environment — if it hangs or errors, fall back to the manual flow
// (build_videos_json.mjs + parse_video_page.mjs) instead of fighting it.
import fs from 'node:fs';
import { chromium } from 'playwright';
import { parseListPage, parseVideoPage, relativeToIsoDate } from './lib/ph_parse.mjs';

const BASE = 'https://www.pornhub.com/pornstar/larunamave/videos/upload';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

async function fetchHtml(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // PH sometimes shows an age/consent interstitial on a fresh session — best effort dismiss.
  try {
    const enter = page.getByText(/enter|i am 18|agree/i).first();
    if (await enter.isVisible({ timeout: 2000 })) await enter.click();
  } catch { /* no interstitial, fine */ }
  await page.waitForTimeout(1500);
  return page.content();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ userAgent: UA, viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log('Fetching recent list...');
  const recentHtml = await fetchHtml(page, `${BASE}?o=mr`);
  console.log('Fetching most-viewed list...');
  const viewedHtml = await fetchHtml(page, `${BASE}?o=mv`);

  const recentList = parseListPage(recentHtml);
  const viewedList = parseListPage(viewedHtml);
  if (!recentList.length || !viewedList.length) {
    throw new Error(`Parsed 0 videos (recent=${recentList.length}, viewed=${viewedList.length}) — PH markup likely changed, or we got a challenge/consent page instead of the real list. Aborting without touching videos.json.`);
  }
  console.log(`Parsed ${recentList.length} recent / ${viewedList.length} most-viewed videos.`);

  const today = new Date().toISOString().slice(0, 10);
  const byKey = new Map();
  for (const v of viewedList) byKey.set(v.vkey, { ...v });
  for (const v of recentList) {
    const existing = byKey.get(v.vkey);
    if (existing) existing.added_relative ??= v.added_relative;
    else byKey.set(v.vkey, { ...v });
  }

  // published set = union of latest5 + top20 — these are the ones that get their own page
  const latestKeys = recentList.slice(0, 5).map((v) => v.vkey);
  const topKeys = viewedList.slice(0, 20).map((v) => v.vkey);
  const published = [...new Set([...latestKeys, ...topKeys])];

  const tagsOverrides = fs.existsSync('tags_overrides.json') ? JSON.parse(fs.readFileSync('tags_overrides.json', 'utf8')) : {};
  let tagFailures = 0;
  for (const vkey of published) {
    const v = byKey.get(vkey);
    try {
      console.log(`Fetching tags for ${vkey} (${v.title.slice(0, 50)}...)`);
      const html = await fetchHtml(page, v.url);
      const parsed = parseVideoPage(html);
      if (parsed && parsed.tags.length) {
        tagsOverrides[vkey] = parsed.tags;
      } else {
        tagFailures++;
        console.warn(`  no tags parsed for ${vkey} — keeping previous/heuristic tags`);
      }
    } catch (e) {
      tagFailures++;
      console.warn(`  failed to fetch ${vkey}: ${e.message}`);
    }
  }
  fs.writeFileSync('tags_overrides.json', JSON.stringify(tagsOverrides, null, 2));

  for (const v of byKey.values()) {
    v.upload_date = relativeToIsoDate(v.added_relative, today);
    if (tagsOverrides[v.vkey]) { v.tags = tagsOverrides[v.vkey]; v.tags_source = 'ph_page'; }
    else { v.tags_source = 'title_heuristic'; }
  }

  const data = {
    last_updated: new Date().toISOString(),
    source: 'scrape_ph.mjs (live, Playwright)',
    latest: latestKeys.map((k) => byKey.get(k)),
    top20_by_views: topKeys.map((k) => byKey.get(k)),
    all_videos: [...byKey.values()],
  };
  fs.writeFileSync('videos.json', JSON.stringify(data, null, 2));

  await browser.close();
  console.log(`Done. videos.json written (${data.all_videos.length} videos). Tag fetch failures: ${tagFailures}/${published.length}.`);
}

main().catch((e) => {
  console.error('scrape_ph.mjs FAILED:', e.message);
  process.exit(1);
});
