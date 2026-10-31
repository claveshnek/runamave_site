// Builds videos.json from the JSON arrays copied by the "Copy Video List" bookmarklet
// (bookmarklets.html) — the manual, bot-detection-free replacement for feeding saved
// HTML pages into build_videos_json.mjs. Same merge logic, just a different input
// shape (JSON stubs instead of regex-parsed HTML).
//   node import_list.mjs <recent-list.json> <viewed-list.json>
import fs from 'node:fs';
import { normalizeStub, relativeToIsoDate } from './lib/ph_parse.mjs';

const [, , recentFile, viewedFile] = process.argv;
if (!recentFile || !viewedFile) {
  console.error('Usage: node import_list.mjs <recent-list.json> <viewed-list.json>');
  process.exit(1);
}

let tagsOverrides = {};
if (fs.existsSync('tags_overrides.json')) {
  tagsOverrides = JSON.parse(fs.readFileSync('tags_overrides.json', 'utf8'));
}

const today = new Date().toISOString().slice(0, 10);
const recentList = JSON.parse(fs.readFileSync(recentFile, 'utf8')).filter((s) => s.vkey).map(normalizeStub);
const viewedList = JSON.parse(fs.readFileSync(viewedFile, 'utf8')).filter((s) => s.vkey).map(normalizeStub);

const byKey = new Map();
for (const v of viewedList) byKey.set(v.vkey, { ...v });
for (const v of recentList) {
  const existing = byKey.get(v.vkey);
  if (existing) existing.added_relative ??= v.added_relative;
  else byKey.set(v.vkey, { ...v });
}
for (const v of byKey.values()) {
  v.upload_date = relativeToIsoDate(v.added_relative, today);
  if (tagsOverrides[v.vkey]) { v.tags = tagsOverrides[v.vkey]; v.tags_source = 'ph_page'; }
  else { v.tags_source = 'title_heuristic'; }
}

const data = {
  last_updated: new Date().toISOString(),
  source: 'manual (bookmarklets.html JSON paste)',
  latest: recentList.slice(0, 5).map((v) => byKey.get(v.vkey)),
  top20_by_views: viewedList.slice(0, 20).map((v) => byKey.get(v.vkey)),
  all_videos: [...byKey.values()],
};
fs.writeFileSync('videos.json', JSON.stringify(data, null, 2));
console.log(`videos.json built: ${data.all_videos.length} unique videos (${recentList.length} from "recent", ${viewedList.length} from "most viewed")`);
