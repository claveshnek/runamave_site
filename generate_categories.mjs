// Generates /categories/[slug].html + /categories/index.html — SEO pages targeting
// 2-3 word niche queries (TASK_SPEC.md Блок 5.3), each a grid of matching videos
// drawn from the published set (videos.json latest + top20 — the ones that actually
// have a /videos/ page to link to).
// Run: node generate_categories.mjs
import fs from 'node:fs';
import path from 'node:path';
import { SITE, escHtml, nav, footer, vcard, pageHead } from './lib/page_parts.mjs';

const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
const published = new Map();
for (const v of [...videos.top20_by_views, ...videos.latest]) {
  if (!published.has(v.vkey)) published.set(v.vkey, v);
}
const allVideos = [...published.values()];

// Each category = a tag-matcher regex (covers the tag spelling variants PH uses)
// run against every video's tags, not a fixed list of exact tag strings.
const CATEGORIES = [
  {
    slug: 'amateur-stepsister',
    title: 'Amateur Stepsister Videos',
    seoTitle: 'Amateur Stepsister Videos - Laruna Mave',
    tagRe: /step\s*sis|stepsister/i,
    intro: 'Laruna Mave\'s stepsister-themed uploads are the core of her catalog — home-style, scripted roleplay scenes built around the classic "stepsister" setup. Real bedrooms, no studio lighting, and the same handheld, amateur camera work across every video. If you\'re specifically looking for amateur stepsister content on PornHub, this is the full list from her channel, newest and most-watched together.',
  },
  {
    slug: 'stepmom-taboo',
    title: 'Stepmom & Taboo Roleplay',
    seoTitle: 'Stepmom Taboo Roleplay Videos - Laruna Mave',
    tagRe: /step\s*mom|stepmom|\btaboo\b/i,
    intro: 'Stepmom and taboo-roleplay scenes from Laruna Mave\'s channel — family-roleplay scenarios that lean into the "taboo" angle her audience keeps coming back for. Every video below is a real upload from her PornHub channel, not a compilation or re-edit.',
  },
  {
    slug: 'amateur-threesome',
    title: 'Amateur Threesome Videos',
    seoTitle: 'Amateur Threesome Videos - Laruna Mave',
    tagRe: /threesome|foursome|3some|ffm|mfm/i,
    intro: 'Multi-performer scenes from Laruna Mave — threesomes and foursomes shot with the same amateur, home-video style as the rest of her catalog. These tend to run longer and give every performer their own moment, rather than rushing to a single finish.',
  },
  {
    slug: 'trans-amateur',
    title: 'Trans Amateur Videos',
    seoTitle: 'Trans Amateur Videos - Laruna Mave',
    tagRe: /trans|shemale|femboy|trap|tgirl/i,
    intro: 'Laruna Mave\'s trans-themed uploads — scenes with trans, transgender, femboy and shemale co-stars, consistently one of the most requested niches on her channel. All videos below are her own PornHub uploads.',
  },
  {
    slug: 'anal-creampie',
    title: 'Anal Creampie Videos',
    seoTitle: 'Anal Creampie Videos - Laruna Mave',
    tagRe: /\banal\b|creampie/i,
    intro: 'Anal and creampie scenes from Laruna Mave\'s channel, filmed in the same close, amateur style throughout — no studio polish, just real reactions.',
  },
];

function categoryPage(cat, matches) {
  const canonical = `${SITE}/categories/${cat.slug}.html`;
  const desc = `${matches.length} ${cat.title.toLowerCase()} by Laruna Mave — amateur, home-shot, free on PornHub. Updated regularly.`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead(cat.seoTitle, desc, canonical, matches[0]?.thumbnail)}
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: 'Categories', item: SITE + '/categories/' },
      { '@type': 'ListItem', position: 3, name: cat.title, item: canonical },
    ],
  })}</script>
</head>
<body>
${nav('categories')}
<p class="crumbs"><a href="/">Home</a> / <a href="/categories/">Categories</a> / ${escHtml(cat.title)}</p>
<div class="wrap">
  <section class="block" style="padding-top:0;">
    <h1 class="page-title">${escHtml(cat.title)}</h1>
    <p class="vdesc">${escHtml(cat.intro)}</p>
    <div class="vgrid" style="margin-top:28px;">
      ${matches.map(vcard).join('\n      ')}
    </div>
  </section>
</div>
${footer()}
</body>
</html>`;
}

function categoriesIndexPage(results) {
  const canonical = `${SITE}/categories/`;
  const desc = 'Browse Laruna Mave\'s videos by category — stepsister, stepmom, threesome, trans, anal and more.';
  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead('Categories - Laruna Mave', desc, canonical)}
</head>
<body>
${nav('categories')}
<div class="wrap">
  <section class="block" style="padding-top:0;">
    <p class="sec-eye">Browse</p>
    <h1 class="page-title">Categories</h1>
    <div class="vgrid" style="grid-template-columns:repeat(2,1fr);">
      ${results.map(({ cat, matches }) => `<a href="/categories/${cat.slug}.html" class="vcard">
        <div class="thumb"><img src="${matches[0]?.thumbnail || ''}" alt="${escHtml(cat.title)}" loading="lazy"></div>
        <p class="vc-title">${escHtml(cat.title)}</p>
        <p class="vc-meta">${matches.length} videos</p>
      </a>`).join('\n      ')}
    </div>
  </section>
</div>
${footer()}
</body>
</html>`;
}

fs.mkdirSync('categories', { recursive: true });
const results = CATEGORIES.map((cat) => ({ cat, matches: allVideos.filter((v) => v.tags.some((t) => cat.tagRe.test(t))) }))
  .filter(({ matches }) => matches.length > 0);

for (const { cat, matches } of results) {
  fs.writeFileSync(path.join('categories', `${cat.slug}.html`), categoryPage(cat, matches));
}
fs.writeFileSync(path.join('categories', 'index.html'), categoriesIndexPage(results));

console.log(`Generated ${results.length} category pages: ${results.map(({ cat, matches }) => `${cat.slug}(${matches.length})`).join(', ')}`);
