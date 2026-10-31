// After `vite build` (+ the SSR build of src/entry-server.jsx into dist-ssr/): writes every page as real HTML with its
// own head (title, description, canonical, link previews, schema.org graph from src/seo.js), so search engines, AI
// crawlers and social previews read the content without JavaScript. Also dist/404.html (served with a 404 status by
// Vercel for unknown URLs) and dist/sitemap.xml with today's date. Run by `npm run build`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const ssr = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href);
const { render, appData, PAGES, SITE, headTags, urlOf } = ssr;

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
if (!template.includes('<!--seo:start-->') || !template.includes('<!--app-html-->')) throw new Error('prerender: index.html markers missing');

// quiet React's server-only notices while rendering (useLayoutEffect on the server, storage not available ...)
const { error, warn } = console;
const quiet = (fn) => { console.error = () => {}; console.warn = () => {}; try { return fn(); } finally { console.error = error; console.warn = warn; } };

const data = quiet(appData);
const page = (key, url) => template
  .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, headTags(key, data))
  .replace('<!--app-html-->', quiet(() => render(url)));

const written = [];
for (const key of Object.keys(PAGES)) {
  const file = key === '/' ? path.join(dist, 'index.html') : path.join(dist, key.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const html = page(key, key);
  fs.writeFileSync(file, html);
  written.push(`${key.padEnd(10)} ${(html.length / 1024).toFixed(0)} KB`);
}
fs.writeFileSync(path.join(dist, '404.html'), page(null, '/page-not-found'));
written.push('404.html');

const today = new Date().toISOString().slice(0, 10);
const priority = { '/': '1.0', '/Projects': '0.9', '/About': '0.8', '/Contact': '0.7', '/Privacy': '0.3' };
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${Object.keys(PAGES).map((k) => `  <url><loc>${urlOf(k)}</loc><lastmod>${today}</lastmod><priority>${priority[k] ?? '0.5'}</priority></url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);

console.log(`prerendered for ${SITE}:\n  ${written.join('\n  ')}\n  sitemap.xml (${today})`);
