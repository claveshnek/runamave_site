// Merges tags/categories JSON copied by the "Copy Video Tags" bookmarklet
// (bookmarklets.html) into tags_overrides.json. Accepts a single {vkey,tags,...}
// object or an array of them.
//   node import_tags.mjs <file.json>
import fs from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node import_tags.mjs <file.json>');
  process.exit(1);
}

const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
const entries = Array.isArray(parsed) ? parsed : [parsed];

const OVERRIDES_PATH = 'tags_overrides.json';
const overrides = fs.existsSync(OVERRIDES_PATH) ? JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf8')) : {};

for (const e of entries) {
  if (!e.vkey || !Array.isArray(e.tags) || !e.tags.length) {
    console.error(`SKIP invalid entry: ${JSON.stringify(e).slice(0, 100)}`);
    continue;
  }
  overrides[e.vkey] = e.tags;
  console.log(`${e.vkey}: ${e.tags.length} tags -> ${e.tags.join(', ')}`);
}

fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2));
console.log(`Saved ${OVERRIDES_PATH} (${Object.keys(overrides).length} videos total)`);
