// Monthly stats updater for larunamave.com   (Node 18+)
//   node update_stats.mjs
// Reads subscribers + views from 3 places, sums them, writes stats.json.
// If a number can't be found, the PREVIOUS value is kept and debug_<name>.html is saved.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const NUM = '[\\d\\s\\u00a0\\u202f,.]+';

// "217,057,612" / "364 432 587" / "413.6M" / "144.7K" -> number
export function parseNum(raw) {
  if (raw == null) return null;
  const s = String(raw).replace(/[\s  ]/g, '').toLowerCase();
  const m = s.match(/^([\d.,]+)(b|m|k|млн|тыс)?$/);
  if (!m) return null;
  const suf = m[2];
  let n = suf ? m[1].replace(',', '.') : m[1].replace(/[.,]/g, '');
  n = parseFloat(n);
  if (isNaN(n)) return null;
  return Math.round(n * ({ b: 1e9, m: 1e6, 'млн': 1e6, k: 1e3, 'тыс': 1e3 }[suf] || 1));
}

// Each platform = list of pages; each field has a regex whose group 1 is the number.
export const PLATFORMS = {
  pornhub: [{
    url: 'https://www.pornhub.com/pornstar/larunamave',
    subs:  new RegExp(`data-title="Subscribers:\\s*(${NUM})"`, 'i'),
    views: new RegExp(`data-title="Video views:\\s*(${NUM})"`, 'i'),
  }],
  xvideos: [{
    url: 'https://www.xv-ru.com/channels/myschoollife',
    subs:  new RegExp(`id="pinfo-subscribers"[^>]*>\\s*<strong>[^<]*</strong>\\s*<span>(${NUM})</span>`, 'i'),
    views: new RegExp(`id="pinfo-videos-views"[^>]*>\\s*<strong>[^<]*</strong>\\s*<span>(${NUM})</span>`, 'i'),
  }],
  xhamster: [
    { url: 'https://xhamster.com/users/larunamave',
      // exact number sits in data-tooltip; fall back to the "144.7K" text
      subs: [
        new RegExp(`data-tooltip="(${NUM})">\\s*<b>[^<]*</b>\\s*subscribers`, 'i'),
        /<b>([\d.,]+\s?[KMB]?)<\/b>\s*subscribers/i,
      ] },
    { url: 'https://xhamster.com/shemale/creators/contest',
      // the creators ranking: card of laruna-mave -> "413.6M views"
      views: [
        /creators\/laruna-mave"\s*>\s*Laruna Mave\s*<\/a>\s*<\/div>\s*<div class="views">\s*([\d.,]+\s?[KMB]?)\s*views/i,
        /creators\/laruna-mave[\s\S]{0,600}?<div class="views">\s*([\d.,]+\s?[KMB]?)\s*views/i,
      ] },
  ],
};

export function find(html, re) {
  for (const r of [].concat(re)) {
    const m = html.match(r);
    if (m) { const v = parseNum(m[1]); if (v && v > 0) return v; }
  }
  return null;
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'age_verified=1; accessAgeDisclaimerPH=1; platform=pc' } });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return await res.text();
}

async function main() {
  const prev = fs.existsSync('stats.json') ? JSON.parse(fs.readFileSync('stats.json', 'utf8')) : { platforms: {} };
  const platforms = {};
  const log = [];
  let n = 0;
  for (const [name, pages] of Object.entries(PLATFORMS)) {
    const old = (prev.platforms || {})[name] || { subs: 0, views: 0 };
    const cur = { ...old };
    for (const page of pages) {
      try {
        const html = await fetchHtml(page.url);
        for (const f of ['subs', 'views']) {
          if (!page[f]) continue;
          const v = find(html, page[f]);
          if (v) { cur[f] = v; log.push(`${name}.${f} = ${v}`); }
          else { log.push(`${name}.${f}: NOT FOUND, kept ${old[f]}  (saved debug_${name}_${++n}.html)`); fs.writeFileSync(`debug_${name}_${n}.html`, html); }
        }
      } catch (e) { log.push(`${name}: ${page.url} FAILED (${e.message}), kept old values`); }
    }
    platforms[name] = cur;
  }
  const total = Object.values(platforms).reduce((a, p) => ({ subs: a.subs + p.subs, views: a.views + p.views }), { subs: 0, views: 0 });
  fs.writeFileSync('stats.json', JSON.stringify({ updated: new Date().toISOString().slice(0, 10), platforms, total }, null, 2));
  console.log(log.join('\n'));
  console.log('TOTAL:', total);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
