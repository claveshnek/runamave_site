// Builds videos.json from two saved PornHub pages:
//   node build_videos_json.mjs <most-recent.html> <most-viewed.html>
// Pages are saved manually (Ctrl+S) from:
//   https://www.pornhub.com/pornstar/larunamave/videos/upload?o=mr  (most recent)
//   https://www.pornhub.com/pornstar/larunamave/videos/upload?o=mv  (most viewed)
// This is the manual-update fallback (TASK_SPEC.md Блок 1.3, вариант В) for when
// scrape_ph.mjs (live, via GitHub Actions) can't reach PH. Same parsing code as the
// live scraper — see lib/ph_parse.mjs.
import fs from 'node:fs';
import { parseListPage, relativeToIsoDate } from './lib/ph_parse.mjs';

const [, , recentFile, viewedFile] = process.argv;
if (!recentFile || !viewedFile) {
  console.error('Usage: node build_videos_json.mjs <most-recent.html> <most-viewed.html>');
  process.exit(1);
}

// Real PH tags (scraped per-video — the list page only gives title/views/duration, not
// tags) override the title-keyword guess. Keyed by vkey. Populated by parse_video_page.mjs
// (manual) or scrape_ph.mjs (live). Format: { "6ad625a1b8859": ["amateur","trans", ...] }
let tagsOverrides = {};
if (fs.existsSync('tags_overrides.json')) {
  tagsOverrides = JSON.parse(fs.readFileSync('tags_overrides.json', 'utf8'));
}

const today = new Date().toISOString().slice(0, 10);
const recentList = parseListPage(fs.readFileSync(recentFile, 'utf8')); // newest -> oldest
const viewedList = parseListPage(fs.readFileSync(viewedFile, 'utf8')); // most views -> least

// merge per-vkey info (recency wins for added_relative/upload_date)
const byKey = new Map();
for (const v of viewedList) byKey.set(v.vkey, { ...v });
for (const v of recentList) {
  const existing = byKey.get(v.vkey);
  if (existing) {
    existing.added_relative ??= v.added_relative;
  } else {
    byKey.set(v.vkey, { ...v });
  }
}
for (const v of byKey.values()) {
  v.upload_date = relativeToIsoDate(v.added_relative, today);
  if (tagsOverrides[v.vkey]) {
    v.tags = tagsOverrides[v.vkey];
    v.tags_source = 'ph_page';
  } else {
    v.tags_source = 'title_heuristic';
  }
}

const latest = recentList.slice(0, 5).map((v) => byKey.get(v.vkey));
const top20_by_views = viewedList.slice(0, 20).map((v) => byKey.get(v.vkey));
const all_videos = [...byKey.values()];

const data = {
  last_updated: new Date().toISOString(),
  source: 'manual (saved PH pages, see build_videos_json.mjs header)',
  latest,
  top20_by_views,
  all_videos,
};

fs.writeFileSync('videos.json', JSON.stringify(data, null, 2));
console.log(`videos.json built: ${all_videos.length} unique videos (${recentList.length} from "recent", ${viewedList.length} from "most viewed")`);
