// Generates /videos/[slug].html for the union of videos.json's "latest" + "top20_by_views",
// plus /videos/index.html (catalog), sitemap.xml and robots.txt.
// Run: node generate_video_pages.mjs
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://larunamave.com';
const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));

// --- merge latest + top20 into the published set, de-duped by vkey ---
const published = new Map();
for (const v of [...videos.top20_by_views, ...videos.latest]) {
  if (!published.has(v.vkey)) published.set(v.vkey, v);
}
const list = [...published.values()];

// --- deterministic pseudo-random pick, seeded by vkey, so re-runs are stable ---
function seedOf(vkey) {
  let h = 0;
  for (const c of vkey) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}
function pick(arr, seed, salt = 0) {
  return arr[(seed + salt) % arr.length];
}

function cap(s) { return s.replace(/\b\w/g, (c) => c.toUpperCase()); }
// Display label for any tag (real PH tag or title-heuristic fallback) — no fixed
// dictionary needed, just title-case it. A few get a nicer label.
const TAG_LABEL_OVERRIDES = { milf: 'MILF' };
function tagLabel(t) { return TAG_LABEL_OVERRIDES[t] || cap(t); }

// --- long-tail SEO keyword phrase (TASK_SPEC.md Блок 5.3: 3-5 word combos, low
// competition) built from the video's real tags: style + scenario + identity + act. ---
const PHRASE_GROUPS = {
  style: ['amateur'],
  scenario: ['stepsister', 'step sis', 'stepsis', 'stepmom', 'stepdad', 'stepbro', 'stepdaughter'],
  identity: ['trans', 'transgender', 'shemales', 'femboy', 'trap'],
  act: ['threesome', 'blowjob', 'double blowjob', 'anal', 'creampie', 'orgasm', 'cum swap', 'cum kiss', 'snowball'],
};
function pickFromGroup(tags, group) {
  const matches = group.filter((g) => tags.includes(g));
  if (!matches.length) return null;
  matches.sort((a, b) => a.split(' ').length - b.split(' ').length);
  return matches[0];
}
function keywordPhrase(tags) {
  const parts = Object.values(PHRASE_GROUPS)
    .map((g) => pickFromGroup(tags, g))
    .filter(Boolean);
  return parts.length ? parts.join(' ') : 'amateur solo video';
}

function article(phrase) { return /^[aeiou]/i.test(phrase) ? 'an' : 'a'; }
const OPENERS = [
  (t, p) => `This ${p} video, "${t}", is one of Laruna Mave's fan-favorite uploads — a scenario built around real tension, playful dialogue and an unmistakably amateur feel.`,
  (t, p) => `Looking for ${article(p)} genuine ${p} scene? "${t}" stars Laruna Mave in a home-style setup shot with the same DIY, authentic energy that built her following on PornHub.`,
  (t, p) => `"${t}" is ${article(p)} ${p} video from Laruna Mave's channel, with the kind of natural chemistry her fans keep coming back for.`,
  (t, p) => `Fans searching for ${p} content tend to land here: "${t}" is classic Laruna Mave — a relatable setup, genuine reactions and zero studio polish.`,
];

const TAG_SENTENCES = {
  stepsister: 'The stepsister roleplay angle gives the scene its storyline, with familiar household tension turning into something more.',
  stepmom: 'A stepmom dynamic runs through the scene, adding an extra layer of taboo-roleplay energy.',
  stepdad: 'A stepdad character drives part of the plot, keeping the family-roleplay theme front and center.',
  stepbro: 'Her stepbrother co-star plays off her energy well, and the back-and-forth feels unscripted in the best way.',
  stepdaughter: 'The stepdaughter framing ties the scene together, a staple of this kind of amateur roleplay.',
  trans: 'A trans performer shares the scene, and their chemistry with Laruna is a big part of why viewers keep rewatching it.',
  threesome: 'It builds into a threesome, with the pacing giving every performer room to be the center of attention.',
  milf: 'An experienced, MILF-coded presence balances out the cast and keeps the energy varied throughout.',
  anal: 'Anal is part of the scene, filmed with the same close, amateur camera style as the rest of her catalog.',
  blowjob: 'There is a strong oral/blowjob segment that fans single out as one of the video\'s highlights.',
  creampie: 'The scene ends on a creampie finish, a recurring request from her regular viewers.',
  orgasm: 'Laruna\'s reactions build toward a visible, unscripted-feeling orgasm — one of the more talked-about moments in the clip.',
  amateur: 'Shot handheld, in a real bedroom setting, it keeps the raw, amateur look that separates her content from studio production.',
  roleplay: 'The whole thing plays out like a short roleplay skit more than a traditional scene, which is very on-brand for her channel.',
  transgender: 'The scene features a transgender co-star, and the natural chemistry between them is a big reason this video keeps getting rewatched.',
  trap: 'It leans into trap/femboy aesthetics, a niche her regular viewers specifically seek out her channel for.',
  shemales: 'Fans of her shemale-tagged uploads will recognize the pairing here — it is one of her more requested dynamics.',
  femboy: 'A femboy co-star is part of the scene, matching the softer, androgynous look her audience asks for.',
  snowball: 'There is a snowball moment near the end, a detail her more dedicated fans tend to call out in comments.',
  'cum swap': 'The scene includes a cum-swap finish, one of the specific requests that keeps this video high in her view count.',
  'step sis': 'Her "step sis" co-star is central to the plot, another entry in her ongoing stepsister-themed series.',
  stepsis: 'Her stepsister co-star is central to the plot, another entry in her ongoing stepsister-themed series.',
  taboo: 'The taboo-roleplay framing is intentional — it is one of the clearest threads running through her whole catalog.',
  'cum kiss': 'It closes on a cum-kiss moment, a small detail that shows up across several of her most-watched uploads.',
  'double blowjob': 'A double-blowjob segment is a highlight here, with two performers sharing the scene instead of one.',
  'double-blowjob': 'A double-blowjob segment is a highlight here, with two performers sharing the scene instead of one.',
};

const CLOSERS = [
  (d) => `At ${d} minutes, it is a solid watch from start to finish — tap play above or head to PornHub for the full, unedited upload.`,
  (d) => `Running ${d} minutes, it's one of the clips that best sums up what her channel is about — watch it here or on her official PornHub page.`,
  (d) => `The full ${d}-minute video streams below, or you can catch it (plus the rest of her uploads) directly on PornHub.`,
];

function durationMinutes(duration) {
  if (!duration) return '10+';
  const [m] = duration.split(':');
  return m;
}

// One sentence per theme family at most, so having both "trans" and "transgender"
// (or "stepsister" and "step sis") doesn't produce two near-duplicate sentences.
const SENTENCE_FAMILIES = [
  ['stepsister', 'step sis', 'stepsis', 'stepmom', 'stepdad', 'stepbro', 'stepdaughter'],
  ['trans', 'transgender', 'shemales', 'femboy', 'trap'],
  ['threesome', 'blowjob', 'double blowjob', 'double-blowjob', 'anal', 'creampie', 'orgasm', 'cum swap', 'cum kiss', 'snowball'],
  ['amateur', 'roleplay', 'taboo', 'milf'],
];
function pickSentences(tags, max = 3) {
  const out = [];
  for (const fam of SENTENCE_FAMILIES) {
    const tag = fam.find((t) => tags.includes(t) && TAG_SENTENCES[t]);
    if (tag) out.push(TAG_SENTENCES[tag]);
    if (out.length >= max) break;
  }
  return out;
}

function buildDescription(v) {
  const seed = seedOf(v.vkey);
  const phrase = keywordPhrase(v.tags);
  const opener = pick(OPENERS, seed, 0)(v.title, phrase);
  const tagSentences = pickSentences(v.tags, 3);
  const closer = pick(CLOSERS, seed, 2)(durationMinutes(v.duration));
  const statLine = v.views
    ? `It has racked up ${v.views} views on PornHub alone, part of her 900M+ combined total across platforms.`
    : '';
  return [opener, ...tagSentences, statLine, closer].filter(Boolean).join(' ');
}

function truncateWords(s, max) {
  if (s.length <= max) return s;
  return s.slice(0, max).replace(/\s+\S*$/, '') + '…';
}
function metaDescription(v) {
  const phrase = keywordPhrase(v.tags);
  const base = `Free ${phrase} video with Laruna Mave. ${v.views || ''} views, ${v.duration || ''} min — watch now on PornHub.`;
  return truncateWords(base, 160);
}

function seoTitle(v) {
  const phrase = keywordPhrase(v.tags);
  let t = `${cap(phrase)} - Laruna Mave`;
  if (t.length > 60) t = `${phrase.split(' ').slice(0, 3).join(' ')} - Laruna Mave`;
  return cap(t);
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function relatedVideos(v, n = 4) {
  const pool = list.filter((x) => x.vkey !== v.vkey);
  const sameTag = pool.filter((x) => x.tags.some((t) => v.tags.includes(t)));
  const rest = pool.filter((x) => !sameTag.includes(x));
  return [...sameTag, ...rest].slice(0, n);
}

function nav(active) {
  const link = (href, label, key) =>
    `<a href="${href}" class="tn-link${active === key ? ' active' : ''}">${label}</a>`;
  return `<div class="topnav">
    <a href="${SITE}/" class="tn-logo">Laruna<em>Mave</em></a>
    <div class="tn-spacer"></div>
    ${link(SITE + '/videos/', 'Videos', 'videos')}
    ${link(SITE + '/#about', 'About', 'about')}
  </div>`;
}

function footer() {
  return `<footer>
    <div class="fn">Laruna Mave</div>
    <div class="fl">
      <a href="/videos/">Videos</a>
      <a href="https://www.pornhub.com/pornstar/larunamave" target="_blank" rel="noopener">PornHub</a>
      <a href="https://www.xvideos.com/channels/myschoollife#_tabVideos" target="_blank" rel="noopener">XVideos</a>
      <a href="https://xhamster.com/users/larunamave" target="_blank" rel="noopener">XHamster</a>
      <a href="https://www.instagram.com/larunamave/" target="_blank" rel="noopener">Instagram</a>
      <a href="https://linktr.ee/LarunaMave" target="_blank" rel="noopener">LinkTree</a>
    </div>
    <p class="fc">© 2025 Laruna Mave · larunamave.com · All rights reserved</p>
    <p class="fc">18+ — all persons depicted are consenting adults</p>
  </footer>`;
}

function vcard(v) {
  return `<a href="/videos/${v.slug}.html" class="vcard">
    <div class="thumb"><img src="${v.thumbnail || ''}" alt="${escHtml(v.title)}" loading="lazy">${v.duration ? `<span class="dur">${v.duration}</span>` : ''}</div>
    <p class="vc-title">${escHtml(v.title)}</p>
    <p class="vc-meta">${v.views || ''} views</p>
  </a>`;
}

function videoObjectSchema(v) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title,
    description: metaDescription(v),
    thumbnailUrl: v.thumbnail ? [v.thumbnail] : undefined,
    uploadDate: v.upload_date || undefined,
    duration: v.duration ? `PT${durationMinutes(v.duration)}M` : undefined,
    contentUrl: v.url,
    embedUrl: `https://www.pornhub.com/embed/${v.vkey}`,
    interactionStatistic: v.views_num ? {
      '@type': 'InteractionCounter',
      interactionType: 'https://schema.org/WatchAction',
      userInteractionCount: v.views_num,
    } : undefined,
  };
}

function breadcrumbSchema(v) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Videos', item: SITE + '/videos/' },
      { '@type': 'ListItem', position: 3, name: v.title, item: `${SITE}/videos/${v.slug}.html` },
    ],
  };
}

function pageHead(title, description, canonical, ogImage) {
  return `<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(title)}</title>
<meta name="description" content="${escHtml(description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${escHtml(title)}">
<meta property="og:description" content="${escHtml(description)}">
<meta property="og:url" content="${canonical}">
${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Cormorant+Garamond:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">`;
}

function videoPage(v) {
  const title = seoTitle(v);
  const desc = metaDescription(v);
  const canonical = `${SITE}/videos/${v.slug}.html`;
  const related = relatedVideos(v);
  const schema = [videoObjectSchema(v), breadcrumbSchema(v)];

  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead(title, desc, canonical, v.thumbnail)}
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
${nav('videos')}
<p class="crumbs"><a href="/">Home</a> / <a href="/videos/">Videos</a> / ${escHtml(v.title)}</p>
<div class="wrap">
  <section class="block" style="padding-top:0;">
    <h1 class="page-title">${escHtml(v.title)}</h1>
    <div class="vmeta">
      <span><b>${v.views || 'N/A'}</b> views</span>
      <span><b>${v.duration || 'N/A'}</b></span>
      ${v.upload_date ? `<span>Uploaded <b>${v.upload_date}</b></span>` : ''}
    </div>
    <div class="player-wrap">
      <iframe src="https://www.pornhub.com/embed/${v.vkey}" frameborder="0" width="560" height="315" scrolling="no" allowfullscreen loading="lazy" title="${escHtml(v.title)}"></iframe>
    </div>
    <div class="cta" style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:8px;">
      <a href="${v.url}" target="_blank" rel="noopener" class="btn-p">▶ Watch on PornHub</a>
      <a href="/videos/" class="btn-s">All Videos</a>
    </div>
    <p style="font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);margin-bottom:8px;">If the player above doesn't load, use the "Watch on PornHub" button.</p>

    <div class="tags">
      ${v.tags.map((t) => `<span class="tag">#${t.replace(/\s+/g, '')}</span>`).join('\n      ')}
    </div>

    <p class="vdesc">${escHtml(buildDescription(v))}</p>

    <div class="model-card">
      <div class="mc-avatar">LM</div>
      <div>
        <div class="mc-name">Laruna Mave</div>
        <div class="mc-stat">900M+ views · 625K+ subscribers</div>
      </div>
      <a href="https://www.pornhub.com/pornstar/larunamave" target="_blank" rel="noopener" class="btn-s mc-link">Subscribe</a>
    </div>
  </section>

  ${related.length ? `<section class="block" style="padding-top:0;">
    <p class="sec-eye">Related</p>
    <p class="sec-title">More Videos</p>
    <div class="vgrid">
      ${related.map(vcard).join('\n      ')}
    </div>
  </section>` : ''}
</div>
${footer()}
</body>
</html>`;
}

function catalogPage() {
  const [heroVideo, ...restLatest] = videos.latest;
  const canonical = `${SITE}/videos/`;
  const title = 'Videos - Laruna Mave';
  const desc = `Browse every Laruna Mave video: the latest uploads and her all-time most-viewed scenes on PornHub, XVideos and XHamster.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead(title, desc, canonical, heroVideo.thumbnail)}
</head>
<body>
${nav('videos')}
<div class="wrap">
  <section class="block" style="padding-top:0;">
    <p class="sec-eye">Latest Video</p>
    <h1 class="page-title">${escHtml(heroVideo.title)}</h1>
    <div class="player-wrap">
      <iframe src="https://www.pornhub.com/embed/${heroVideo.vkey}" frameborder="0" width="560" height="315" scrolling="no" allowfullscreen loading="lazy" title="${escHtml(heroVideo.title)}"></iframe>
    </div>
    <div class="cta" style="display:flex;gap:14px;flex-wrap:wrap;">
      <a href="/videos/${heroVideo.slug}.html" class="btn-p">▶ Watch on PornHub</a>
      <a href="/videos/${heroVideo.slug}.html" class="btn-s">Video Details</a>
    </div>
  </section>

  <section class="block" style="padding-top:0;">
    <p class="sec-eye">New</p>
    <p class="sec-title">Recent Uploads</p>
    <div class="vgrid">
      ${restLatest.map(vcard).join('\n      ')}
    </div>
  </section>

  <section class="block">
    <p class="sec-eye">All Time</p>
    <p class="sec-title">Top 20 by Views</p>
    <div class="vgrid">
      ${videos.top20_by_views.map(vcard).join('\n      ')}
    </div>
  </section>
</div>
${footer()}
</body>
</html>`;
}

// --- write everything ---
fs.mkdirSync('videos', { recursive: true });
for (const v of list) {
  fs.writeFileSync(path.join('videos', `${v.slug}.html`), videoPage(v));
}
fs.writeFileSync(path.join('videos', 'index.html'), catalogPage());

// --- sitemap.xml ---
const urls = [
  { loc: `${SITE}/`, priority: '1.0' },
  { loc: `${SITE}/videos/`, priority: '0.9' },
  ...list.map((v) => ({ loc: `${SITE}/videos/${v.slug}.html`, priority: '0.7', lastmod: v.upload_date })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync('sitemap.xml', sitemap);

// --- robots.txt ---
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`Generated ${list.length} video pages + /videos/index.html + sitemap.xml + robots.txt`);
