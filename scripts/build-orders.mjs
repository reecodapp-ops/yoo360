import { build } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const orderRoot = path.join(root, 'order-app');
const require = createRequire(path.join(orderRoot, 'package.json'));
const { default: tailwind } = await import(pathToFileURL(require.resolve('@tailwindcss/vite')));
const common = {
  configFile: false,
  root: orderRoot,
  base: '/order-a-design/',
  plugins: [react(), tailwind()],
  resolve: { alias: { '@': orderRoot } },
  css: { postcss: { plugins: [] } },
};

await build({ ...common, build: { outDir: path.join(root, 'dist/order-a-design'), emptyOutDir: true } });
const template = await readFile('dist/order-a-design/index.html', 'utf8');
await build({ ...common, ssr: { noExternal: true }, build: {
  ssr: path.join(orderRoot, 'prerender.tsx'), outDir: path.join(root, 'dist-ssr/orders'), emptyOutDir: true,
  rollupOptions: { output: { entryFileNames: 'prerender.mjs' } },
} });
const { renderOrderPage } = await import(pathToFileURL(path.join(root, 'dist-ssr/orders/prerender.mjs')));
const routes = [
  { path: '', screen: 'home', title: 'Order a Design | Yoo360', description: 'Choose Logo & Brand Visual Identity from $149.99 or Marketing & Print Design from $40. Order directly with Yoo360.' },
  { path: '/order/logo', screen: 'logo', title: 'Logo & Brand Visual Identity | Yoo360', description: 'Order a basic logo from $149.99 or the complete visual identity package at $499.99. Choose your Yoo360 design deliverables.' },
  { path: '/order/graphics', screen: 'graphics', title: 'Marketing & Print Design | Yoo360', description: 'Order marketing and print designs from $40 per project. Name each design and choose the files and delivery options you need.' },
  { path: '/checkout', screen: 'checkout', title: 'Secure Checkout | Yoo360', private: true },
  { path: '/payment-status', screen: 'payment', title: 'Payment Status | Yoo360', private: true },
  { path: '/request-received', screen: 'received', title: 'Request Received | Yoo360', private: true },
  { path: '/project-brief', screen: 'brief', title: 'Project Brief | Yoo360', private: true },
  { path: '/order', screen: 'status', title: 'Your Design Order | Yoo360', private: true },
];
const escape = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
for (const route of routes) {
  const url = 'https://www.theyoo360.com/order-a-design' + route.path;
  const metadata = `<title>${escape(route.title)}</title>
    <meta name="robots" content="${route.private ? 'noindex, nofollow' : 'index, follow'}" />
    ${route.private ? '' : `<meta name="description" content="${escape(route.description)}" /><link rel="canonical" href="${url}" />`}
    <meta property="og:title" content="${escape(route.title)}" />
    <meta property="og:type" content="website" />
    ${route.private ? '' : `<meta property="og:url" content="${url}" />`}
    <meta property="og:site_name" content="Yoo360" />
    <meta property="og:image" content="https://www.theyoo360.com/brand/yoo360-og.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="https://www.theyoo360.com/brand/yoo360-og.png" />`;
  const html = template.replace('<!-- order-metadata -->', metadata).replace('<div id="root"></div>', `<div id="root">${renderOrderPage(route.screen)}</div>`);
  const directory = path.join(root, 'dist/order-a-design', route.path);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'index.html'), html);
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
await writeFile('dist/sitemap.xml', sitemap.replace('</urlset>', routes.filter(r => !r.private).map(r => `  <url><loc>https://www.theyoo360.com/order-a-design${r.path}</loc></url>`).join('\n') + '\n</urlset>'));
console.log('Built the separate ordering frontend and public routes under /order-a-design; private customer routes remain excluded from indexing.');
