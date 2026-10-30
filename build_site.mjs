// Builds index.html from larunamave.template.html + stats.json
// Run: node build_site.mjs
import fs from 'node:fs';

const s = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
const P = s.platforms, T = s.total;
const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
const latestVideo = videos.latest[0];

const short = (n) => {                     // 582000000 -> 582M ; 365412 -> 365K ; 1_250_000_000 -> 1.25B
  if (n >= 1e9) return +(n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return Math.floor(n / 1e6) + 'M';
  if (n >= 1e3) return Math.floor(n / 1e3) + 'K';
  return String(n);
};
const jaBig = (n) => {                     // 582000000 -> 5億8200万
  const man = Math.floor(n / 1e4), oku = Math.floor(man / 1e4), rest = man % 1e4;
  return oku ? `${oku}億${rest}万` : `${rest}万`;
};
const zhBig = (n) => n >= 1e8 ? (Math.floor(n / 1e6) / 100) + '亿' : (Math.floor(n / 1e3) / 10) + '万';
const jaSubs = (n) => { const man = Math.floor(n / 1e4), th = Math.floor((n % 1e4) / 1e3) * 1e3; return th ? `${man}万${th}` : `${man}万`; };
const zhSubs = (n) => (Math.floor(n / 1e3) / 10) + '万';

const map = {
  VIEWS: short(T.views) + '+',
  VIEWS_M: String(Math.floor(T.views / 1e6)),
  VIEWS_JA: jaBig(T.views),
  VIEWS_ZH: zhBig(T.views),
  SUBS: short(T.subs),
  SUBS_JA: jaSubs(T.subs),
  SUBS_ZH: zhSubs(T.subs).replace(/万$/, '万'),
  PH_V: short(P.pornhub.views),  XV_V: short(P.xvideos.views),  XH_V: short(P.xhamster.views),
  PH_S: short(P.pornhub.subs),   XV_S: short(P.xvideos.subs),   XH_S: short(P.xhamster.subs),
  LATEST_URL: latestVideo.url,
  LATEST_TITLE: latestVideo.title,
  LATEST_DURATION: latestVideo.duration,
};

let html = fs.readFileSync('larunamave.template.html', 'utf8');
html = html.replace(/\{\{(\w+)\}\}/g, (_, k) => {
  if (!(k in map)) throw new Error('Unknown placeholder ' + k);
  return map[k];
});
fs.writeFileSync('index.html', html);
console.log('index.html built', map);
