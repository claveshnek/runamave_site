// Shared page chrome (nav/footer/card/head) used by every generator script
// (generate_video_pages.mjs, generate_categories.mjs, generate_blog.mjs) so the
// site looks consistent and nav links only need updating in one place.
export const SITE = 'https://larunamave.com';

export function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function nav(active) {
  const link = (href, label, key) =>
    `<a href="${href}" class="tn-link${active === key ? ' active' : ''}">${label}</a>`;
  return `<div class="topnav">
    <a href="${SITE}/" class="tn-logo">Laruna<em>Mave</em></a>
    <div class="tn-spacer"></div>
    ${link(SITE + '/videos/', 'Videos', 'videos')}
    ${link(SITE + '/categories/', 'Categories', 'categories')}
    ${link(SITE + '/blog/', 'Blog', 'blog')}
    ${link(SITE + '/#about', 'About', 'about')}
  </div>`;
}

export function footer() {
  return `<footer>
    <div class="fn">Laruna Mave</div>
    <div class="fl">
      <a href="/videos/">Videos</a>
      <a href="/categories/">Categories</a>
      <a href="/blog/">Blog</a>
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

export function vcard(v) {
  return `<a href="/videos/${v.slug}.html" class="vcard">
    <div class="thumb"><img src="${v.thumbnail || ''}" alt="${escHtml(v.title)}" loading="lazy">${v.duration ? `<span class="dur">${v.duration}</span>` : ''}</div>
    <p class="vc-title">${escHtml(v.title)}</p>
    <p class="vc-meta">${v.views || ''} views</p>
  </a>`;
}

export function pageHead(title, description, canonical, ogImage) {
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
