// Generates /blog/[slug].html + /blog/index.html — informational content per
// TASK_SPEC.md Блок 3 (E-E-A-T bio post, top-videos roundup, platform comparison).
// Run: node generate_blog.mjs
import fs from 'node:fs';
import path from 'node:path';
import { SITE, escHtml, nav, footer, vcard, pageHead } from './lib/page_parts.mjs';

const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
const stats = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
const published = new Map();
for (const v of [...videos.top20_by_views, ...videos.latest]) {
  if (!published.has(v.vkey)) published.set(v.vkey, v);
}
const allVideos = [...published.values()];

const fmt = (n) => n >= 1e6 ? Math.floor(n / 1e6) + 'M' : n >= 1e3 ? Math.floor(n / 1e3) + 'K' : String(n);

const topTen = videos.top20_by_views.slice(0, 10);

const POSTS = [
  {
    slug: 'about-laruna-mave-amateur-to-900m-views',
    title: 'About Laruna Mave — From Amateur to 900M+ Views',
    date: '2026-10-15',
    excerpt: 'How an independent creator of Slavic descent built a 900M+ view, 625K+ subscriber following across PornHub, XVideos and XHamster — in her own words.',
    bodyHtml: `
<p>Laruna Mave — also known by her channel name <strong>myschoollife</strong> — is an independent amateur content creator of Slavic descent, known for her red hair, tattoos and a style that stays deliberately unpolished. Across <a href="https://www.pornhub.com/pornstar/larunamave" target="_blank" rel="noopener">PornHub</a>, <a href="https://www.xvideos.com/channels/myschoollife#_tabVideos" target="_blank" rel="noopener">XVideos</a> and <a href="https://xhamster.com/users/larunamave" target="_blank" rel="noopener">XHamster</a> combined, her catalog has crossed ${fmt(stats.total.views)}+ views and ${fmt(stats.total.subs)}+ subscribers.</p>

<p>She has always wanted to be on camera. The amateur route specifically came later, after a friend pointed out how much the format was trending — real settings, real reactions, none of the studio gloss. That framing stuck: Laruna has said more than once that she films for herself first, not for popularity, which is part of why her catalog leans so heavily on home-shot, roleplay-style scenes rather than anything scripted by a studio.</p>

<p>Off camera, her interests are a pretty normal mix for someone her age: RPG video games, motorcycles, space, and dogs. She's 173 cm, 54 kg, with measurements of 94-59-89 — details she's shared openly rather than left to guesswork, the same way she treats most of her public profile.</p>

<h2>What her catalog actually looks like</h2>
<p>The throughline across her videos is the "stepsister" / family-roleplay format — see the <a href="/categories/amateur-stepsister.html">amateur stepsister</a> and <a href="/categories/stepmom-taboo.html">stepmom &amp; taboo roleplay</a> categories for the bulk of it — alongside a consistent run of <a href="/categories/amateur-threesome.html">amateur threesome</a> scenes and a well-known <a href="/categories/trans-amateur.html">trans-themed</a> series that regularly ranks among her most-viewed uploads.</p>

<p>New videos go up on a rolling basis; the <a href="/videos/">Videos</a> page always shows her latest upload front and center, plus the all-time most-viewed scenes from across her career.</p>

<h2>Where to find her</h2>
<p>PornHub is her primary channel, with XVideos and XHamster mirroring most of the same catalog. She also posts on <a href="https://www.instagram.com/larunamave/" target="_blank" rel="noopener">Instagram</a> and keeps a full link list on <a href="https://linktr.ee/LarunaMave" target="_blank" rel="noopener">LinkTree</a>.</p>
`,
  },
  {
    slug: 'top-videos-by-laruna-mave',
    title: `Top ${topTen.length} Most Popular Videos by Laruna Mave`,
    date: '2026-10-22',
    excerpt: `A ranked look at Laruna Mave's most-watched uploads on PornHub, by view count — from ${topTen[0]?.views || 'N/A'} views down.`,
    bodyHtml: `
<p>Laruna Mave has uploaded dozens of videos across her channels, but a handful consistently sit at the top by view count. Here are her ${topTen.length} most-watched, ranked, with what makes each one stand out.</p>
<ol>
${topTen.map((v, i) => `  <li><a href="/videos/${v.slug}.html"><strong>${escHtml(v.title)}</strong></a> — ${v.views || 'N/A'} views, ${v.duration || 'N/A'}. ${v.tags.slice(0, 3).map((t) => '#' + t.replace(/\s+/g, '')).join(' ')}</li>`).join('\n')}
</ol>
<p>Views shift over time — the full, always-current ranking lives on the <a href="/videos/">Videos</a> page, sorted by views and by upload date. If you're after a specific theme rather than a ranking, the <a href="/categories/">Categories</a> page breaks her catalog down by stepsister, threesome, trans, anal/creampie and taboo-roleplay content.</p>
<p>For the latest upload specifically — not just the all-time most-viewed — the <a href="/">homepage</a> always links straight to her newest video on PornHub.</p>
`,
  },
  {
    slug: 'laruna-mave-pornhub-vs-xvideos-vs-xhamster',
    title: 'Laruna Mave Across Platforms: PornHub vs XVideos vs XHamster',
    date: '2026-10-29',
    excerpt: 'How Laruna Mave\'s audience and numbers compare across her three main platforms, updated monthly.',
    bodyHtml: `
<p>Laruna Mave publishes the same core catalog across three platforms, but the numbers — and to some extent the audience — differ on each. Here's the current breakdown (last updated ${stats.updated}):</p>
<table style="width:100%;border-collapse:collapse;margin:20px 0;font-family:'DM Mono',monospace;font-size:13px;">
  <thead><tr style="border-bottom:1px solid var(--muted);text-align:left;">
    <th style="padding:8px 4px;">Platform</th><th style="padding:8px 4px;">Views</th><th style="padding:8px 4px;">Subscribers</th>
  </tr></thead>
  <tbody>
    <tr style="border-bottom:1px solid #222;"><td style="padding:8px 4px;"><a href="https://www.pornhub.com/pornstar/larunamave" target="_blank" rel="noopener">PornHub</a></td><td style="padding:8px 4px;">${fmt(stats.platforms.pornhub.views)}+</td><td style="padding:8px 4px;">${fmt(stats.platforms.pornhub.subs)}+</td></tr>
    <tr style="border-bottom:1px solid #222;"><td style="padding:8px 4px;"><a href="https://www.xvideos.com/channels/myschoollife#_tabVideos" target="_blank" rel="noopener">XVideos</a></td><td style="padding:8px 4px;">${fmt(stats.platforms.xvideos.views)}+</td><td style="padding:8px 4px;">${fmt(stats.platforms.xvideos.subs)}+</td></tr>
    <tr><td style="padding:8px 4px;"><a href="https://xhamster.com/users/larunamave" target="_blank" rel="noopener">XHamster</a></td><td style="padding:8px 4px;">${fmt(stats.platforms.xhamster.views)}+</td><td style="padding:8px 4px;">${fmt(stats.platforms.xhamster.subs)}+</td></tr>
  </tbody>
</table>
<p><strong>PornHub</strong> is her primary channel and gets new uploads first — it's also where the embed on every <a href="/videos/">video page</a> on this site streams from. <strong>XVideos</strong> mirrors most of the same catalog under the channel name myschoollife. <strong>XHamster</strong> has the largest view count of the three despite a smaller subscriber base, which tracks with how XHamster's discovery/ranking pages tend to drive a lot of non-subscriber traffic.</p>
<p>Combined, that's ${fmt(stats.total.views)}+ views and ${fmt(stats.total.subs)}+ subscribers across all three — numbers that get pulled and updated here automatically each month. For the single best starting point regardless of platform, the <a href="/">homepage</a> always links to her latest upload.</p>
`,
  },
];

function postPage(post) {
  const canonical = `${SITE}/blog/${post.slug}.html`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead(`${post.title} - Laruna Mave`, post.excerpt, canonical)}
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { '@type': 'Person', name: 'Laruna Mave' },
    publisher: { '@type': 'Organization', name: 'Laruna Mave' },
    mainEntityOfPage: canonical,
  })}</script>
</head>
<body>
${nav('blog')}
<p class="crumbs"><a href="/">Home</a> / <a href="/blog/">Blog</a> / ${escHtml(post.title)}</p>
<div class="wrap">
  <section class="block" style="padding-top:0;max-width:760px;">
    <h1 class="page-title">${escHtml(post.title)}</h1>
    <p style="font-family:'DM Mono',monospace;font-size:10px;color:var(--muted);margin-bottom:24px;">${post.date}</p>
    <div class="vdesc" style="max-width:none;">${post.bodyHtml}</div>
    <p style="margin-top:36px;"><a href="/blog/" class="btn-s">← All Posts</a></p>
  </section>
</div>
${footer()}
</body>
</html>`;
}

function blogIndexPage() {
  const canonical = `${SITE}/blog/`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead('Blog - Laruna Mave', 'News, stats and background on Laruna Mave — updated regularly.', canonical)}
</head>
<body>
${nav('blog')}
<div class="wrap">
  <section class="block" style="padding-top:0;max-width:760px;">
    <p class="sec-eye">Blog</p>
    <h1 class="page-title">Latest Posts</h1>
    ${POSTS.slice().reverse().map((p) => `<a href="/blog/${p.slug}.html" style="display:block;text-decoration:none;color:inherit;background:var(--dark2);padding:20px 24px;margin-bottom:16px;">
      <p style="font-family:'DM Mono',monospace;font-size:9px;color:var(--muted);margin-bottom:6px;">${p.date}</p>
      <p style="font-family:'Playfair Display',serif;font-size:20px;color:var(--cream);margin-bottom:8px;">${escHtml(p.title)}</p>
      <p style="font-size:14px;color:var(--text);">${escHtml(p.excerpt)}</p>
    </a>`).join('\n    ')}
  </section>
</div>
${footer()}
</body>
</html>`;
}

fs.mkdirSync('blog', { recursive: true });
for (const post of POSTS) fs.writeFileSync(path.join('blog', `${post.slug}.html`), postPage(post));
fs.writeFileSync(path.join('blog', 'index.html'), blogIndexPage());

console.log(`Generated ${POSTS.length} blog posts + /blog/index.html`);
