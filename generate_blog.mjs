// Generates /blog/[slug].html + /blog/index.html.
// Two kinds of posts:
//  1. Programmatic (top-videos, platform-comparison) — built from live
//     videos.json/stats.json so the numbers stay current automatically.
//  2. Author-written — any `.md` file dropped into blog-posts/ (frontmatter +
//     markdown body). Add one straight on github.com ("Add file" button) and
//     the rebuild-on-data-change.yml workflow publishes it automatically —
//     no code, no local setup needed. See blog-posts/README.md.
// Run: node generate_blog.mjs
import fs from 'node:fs';
import path from 'node:path';
import { SITE, escHtml, nav, footer, pageHead } from './lib/page_parts.mjs';
import { mdToHtml, parseFrontmatter } from './lib/markdown.mjs';

const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
const stats = JSON.parse(fs.readFileSync('stats.json', 'utf8'));
const fmt = (n) => n >= 1e6 ? Math.floor(n / 1e6) + 'M' : n >= 1e3 ? Math.floor(n / 1e3) + 'K' : String(n);
const topTen = videos.top20_by_views.slice(0, 10);

const PROGRAMMATIC_POSTS = [
  {
    slug: 'top-videos-by-laruna-mave',
    title: `Top ${topTen.length} Most Popular Videos by Laruna Mave`,
    date: '2026-10-22',
    excerpt: `A ranked look at Laruna Mave's most-watched uploads on PornHub, by view count — from ${topTen[0]?.views || 'N/A'} views down.`,
    bodyHtml: `
<p>Laruna Mave has uploaded dozens of videos across her channels, but a handful consistently sit at the top by view count. Here are her ${topTen.length} most-watched, ranked, with what makes each one stand out.</p>
<ol>
${topTen.map((v) => `  <li><a href="/videos/${v.slug}.html"><strong>${escHtml(v.title)}</strong></a> — ${v.views || 'N/A'} views, ${v.duration || 'N/A'}. ${v.tags.slice(0, 3).map((t) => '#' + t.replace(/\s+/g, '')).join(' ')}</li>`).join('\n')}
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

function loadMarkdownPosts() {
  const dir = 'blog-posts';
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      if (!meta.title || !meta.date) {
        console.warn(`SKIP blog-posts/${f}: missing required "title" or "date" in frontmatter.`);
        return null;
      }
      const slug = meta.slug || f.replace(/\.md$/, '');
      return {
        slug,
        title: meta.title,
        date: meta.date,
        excerpt: meta.excerpt || '',
        bodyHtml: mdToHtml(body),
      };
    })
    .filter(Boolean);
}

const POSTS = [...PROGRAMMATIC_POSTS, ...loadMarkdownPosts()].sort((a, b) => a.date.localeCompare(b.date));

function postPage(post) {
  const canonical = `${SITE}/blog/${post.slug}.html`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
${pageHead(`${post.title} - Laruna Mave`, post.excerpt || post.title, canonical)}
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

console.log(`Generated ${POSTS.length} blog posts (${PROGRAMMATIC_POSTS.length} programmatic + ${POSTS.length - PROGRAMMATIC_POSTS.length} from blog-posts/*.md) + /blog/index.html`);
