// Builds sitemap.xml + robots.txt by scanning every generated section
// (videos/, categories/, blog/) plus the root pages. Run this AFTER the other
// generators (build_site.mjs, generate_video_pages.mjs, generate_categories.mjs,
// generate_blog.mjs) so it picks up whatever actually exists on disk.
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://larunamave.com';
const videos = JSON.parse(fs.readFileSync('videos.json', 'utf8'));
const upload = (slug) => {
  const v = videos.all_videos.find((x) => x.slug === slug);
  return v?.upload_date;
};

function section(dir, priority, lastmodFor) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.html') && f !== 'index.html')
    .map((f) => ({ loc: `${SITE}/${dir}/${f}`, priority, lastmod: lastmodFor?.(f.replace(/\.html$/, '')) }));
}

const urls = [
  { loc: `${SITE}/`, priority: '1.0' },
  { loc: `${SITE}/videos/`, priority: '0.9' },
  { loc: `${SITE}/categories/`, priority: '0.8' },
  { loc: `${SITE}/blog/`, priority: '0.6' },
  ...section('videos', '0.7', upload),
  ...section('categories', '0.6'),
  ...section('blog', '0.5'),
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
fs.writeFileSync('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);

console.log(`sitemap.xml: ${urls.length} URLs (videos: ${section('videos').length}, categories: ${section('categories').length}, blog: ${section('blog').length})`);
