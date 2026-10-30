// Auto-extracts real tags/categories from one or more SAVED individual PornHub
// video pages (the full "view_video.php?viewkey=..." page, not the list page) and
// merges them into tags_overrides.json, keyed by vkey. No manual typing needed —
// just save the video's page (Ctrl+S) and run this on it.
//   node parse_video_page.mjs "C:/path/to/Video Title - Pornhub.com.html" [more files...]
import fs from 'node:fs';
import { parseVideoPage } from './lib/ph_parse.mjs';

const files = process.argv.slice(2);
if (!files.length) {
  console.error('Usage: node parse_video_page.mjs <video-page.html> [more files...]');
  process.exit(1);
}

const OVERRIDES_PATH = 'tags_overrides.json';
const overrides = fs.existsSync(OVERRIDES_PATH) ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8')) : {};

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const parsed = parseVideoPage(html);
  if (!parsed) {
    console.error(`SKIP ${file}: no viewkey found (is this a saved video page?)`);
    continue;
  }
  if (!parsed.tags.length) {
    console.error(`SKIP ${file}: vkey ${parsed.vkey} found but no tags parsed — PH markup may have changed.`);
    continue;
  }
  overrides[parsed.vkey] = parsed.tags;
  console.log(`${parsed.vkey}: ${parsed.tags.length} tags, ${parsed.categories.length} categories -> ${parsed.tags.join(', ')}`);
}

fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2));
console.log(`Saved ${OVERRIDES_PATH} (${Object.keys(overrides).length} videos total)`);
