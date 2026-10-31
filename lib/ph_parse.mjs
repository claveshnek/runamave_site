// Shared PornHub HTML parsing — used by both the manual flow (build_videos_json.mjs,
// parse_video_page.mjs, fed saved HTML files), import_list.mjs/import_tags.mjs (fed
// JSON pasted from the browser bookmarklets — see bookmarklets.html), and scrape_ph.mjs
// (fed live-fetched HTML, kept as reference/fallback only — PH blocks automated fetches
// from datacenter IPs, and we do not route around that). Keeping one copy of the
// regexes means the markup only has to be re-tuned in one place if PH changes its page
// structure.

export function decodeEntities(s) {
  if (!s) return s;
  return s
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d));
}

export function slugify(title, vkey) {
  const words = decodeEntities(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 8);
  return words.join('-') + '-' + vkey.slice(-6);
}

export function parseViews(str) {
  if (!str) return 0;
  const m = str.trim().match(/^([\d.]+)\s*([KMB]?)$/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const mult = { K: 1e3, M: 1e6, B: 1e9, '': 1 }[m[2].toUpperCase()];
  return Math.round(n * mult);
}

export function relativeToIsoDate(added, today) {
  if (!added) return null;
  const m = added.match(/^(\d+)\s+(hour|day|week|month|year)s?\s+ago$/i);
  if (!m) return null;
  const n = +m[1];
  const days = { hour: 0, day: 1, week: 7, month: 30, year: 365 }[m[2].toLowerCase()];
  const d = new Date(today);
  d.setUTCDate(d.getUTCDate() - n * days);
  return d.toISOString().slice(0, 10);
}

const TAG_RULES = [
  ['stepsister', /step\s*sis(ter)?/i],
  ['stepmom', /step\s*mom/i],
  ['stepdad', /step\s*dad/i],
  ['stepbro', /step\s*bro(ther)?/i],
  ['stepdaughter', /step\s*daughter/i],
  ['trans', /\btrans\b/i],
  ['threesome', /threesome|foursome/i],
  ['milf', /\bmilf\b/i],
  ['anal', /\banal\b/i],
  ['blowjob', /blow\s*job/i],
  ['creampie', /creampie/i],
  ['orgasm', /orgasm/i],
  ['amateur', /amateur|homemade|real\b/i],
  ['roleplay', /roleplay|homeglory|glory ?hole/i],
];
// Fallback only — used when we don't (yet) have the video's own page with real PH tags.
export function tagsFromTitle(title) {
  const t = decodeEntities(title);
  return TAG_RULES.filter(([, re]) => re.test(t)).map(([tag]) => tag);
}

/** Parses a PH pornstar "videos/upload?o=mr|mv" LIST page (saved HTML) into video
 *  stubs (title/duration/views/added — no tags; list pages don't carry them). */
export function parseListPage(html) {
  const blocks = html.match(/<li class="pcVideoListItem[^>]*>[\s\S]*?<\/li>/g) || [];
  const out = [];
  for (const b of blocks) {
    if (!b.includes('/pornstar/larunamave"')) continue; // skip promo/related videos from other models
    const vkey = (b.match(/data-video-vkey="([^"]+)"/) || [])[1];
    if (!vkey) continue;
    const rawTitle = (b.match(/title="([^"]+)"\s+class="thumbnailTitle/) || b.match(/alt="([^"]+)"/) || [])[1];
    if (!rawTitle) continue;
    const thumb = (b.match(/data-mediumthumb="([^"]+)"/) || b.match(/data-image="([^"]+)"/) || [])[1];
    const duration = (b.match(/class="[^"]*duration[^"]*"[^>]*>([\d:]+)</) || [])[1];
    const viewsStr = (b.match(/class="views">[\s\S]*?<var>([^<]+)<\/var>/) || [])[1];
    const added = (b.match(/class="added">([^<]+)</) || [])[1];
    out.push(normalizeStub({ vkey, title: decodeEntities(rawTitle), thumbnail: thumb, duration, views: viewsStr, added_relative: added }));
  }
  return out;
}

/** Normalizes one video stub (from either the HTML-regex parser above or the JSON
 *  the list-page bookmarklet copies to the clipboard) into the shape videos.json uses. */
export function normalizeStub({ vkey, title, thumbnail, duration, views, added_relative }) {
  return {
    vkey,
    title,
    slug: slugify(title, vkey),
    url: `https://www.pornhub.com/view_video.php?viewkey=${vkey}`,
    thumbnail: thumbnail || null,
    duration: duration || null,
    views: views || null,
    views_num: parseViews(views),
    added_relative: added_relative || null,
    tags: tagsFromTitle(title),
  };
}

/** Parses a PH individual video page's SAVED HTML for its real tags + categories.
 *  Returns null if the page doesn't look like a video page. */
export function parseVideoPage(html) {
  const vkey = (html.match(/view_video\.php\?viewkey=([a-z0-9]+)/i) || [])[1];
  if (!vkey) return null;
  const tagsBlock = (html.match(/class="tagsWrapper">([\s\S]*?)<\/div>/) || [])[1] || '';
  const tags = [...tagsBlock.matchAll(/isTag"[^>]*><span>([^<]+)<\/span>/g)].map((m) => decodeEntities(m[1]));
  const catBlock = (html.match(/class="categoriesWrapper">([\s\S]*?)<\/div>/) || [])[1] || '';
  const categories = [...catBlock.matchAll(/data-label="category"[^>]*>([^<]+)<\/a>/g)].map((m) => decodeEntities(m[1]));
  return { vkey, tags, categories };
}
