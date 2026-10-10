import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { build } from 'vite';

const origin = 'https://www.theyoo360.com';
const logo = `${origin}/icon-512.png`;
const shareImage = `${origin}/brand/yoo360-og.png`;
const shareImageAlt = 'Yoo360. Helping brands that do good look good.';
const pages = [
  {
    path: '/', file: 'dist/index.html',
    title: 'Yoo360 | Branding, Graphic & Web Design in East Africa',
    description: 'Yoo360 helps brands in East Africa and beyond with logo design, visual identity, marketing design, websites and mobile apps. Order a design or discuss a project.',
    type: 'WebPage',
  },
  {
    path: '/discuss-a-project', file: 'dist/discuss-a-project/index.html',
    title: 'Discuss a Brand or Marketing Project | Yoo360',
    description: 'Plan a brand project, marketing campaign or monthly creative partnership with Yoo360. Tell us what you need through our short project enquiry form.',
    type: 'ContactPage',
  },
  {
    path: '/404.html', file: 'dist/404.html',
    title: 'Page not found | Yoo360',
    description: 'This page could not be found. Return to Yoo360 to explore our services and work.',
    noindex: true,
  },
];

const organization = {
  '@type': 'Organization', '@id': `${origin}/#organization`,
  name: 'Yoo360', url: `${origin}/`, logo,
  description: 'Creative design, brand identity, web development and mobile apps for brands in East Africa and beyond.',
  areaServed: { '@type': 'Place', name: 'East Africa' },
  hasOfferCatalog: {
    '@type': 'OfferCatalog', name: 'Yoo360 services',
    itemListElement: ['Creative Design', 'Brand Identity', 'Web Development', 'Mobile Apps'].map(name => ({
      '@type': 'Offer', itemOffered: { '@type': 'Service', name, provider: { '@id': `${origin}/#organization` } },
    })),
  },
};

const escape = text => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

function metadata(page) {
  const title = escape(page.title);
  const description = escape(page.description);
  if (page.noindex) return `<title>${title}</title>\n    <meta name="description" content="${description}" />\n    <meta name="robots" content="noindex, follow" />`;
  const url = origin + page.path;
  const pageSchema = { '@type': page.type, '@id': `${url}#webpage`, url, name: page.title, description: page.description, inLanguage: 'en', isPartOf: { '@id': `${origin}/#website` }, about: { '@id': `${origin}/#organization` } };
  const graph = [
    organization,
    { '@type': 'WebSite', '@id': `${origin}/#website`, url: `${origin}/`, name: 'Yoo360', inLanguage: 'en', publisher: { '@id': `${origin}/#organization` } },
    pageSchema,
  ];
  if (page.member) {
    const member = page.member;
    const personId = `${url}#person`;
    pageSchema.mainEntity = { '@id': personId };
    pageSchema.about = { '@id': personId };
    graph.push({
      '@type': 'Person', '@id': personId, url,
      name: member.name, jobTitle: member.role, description: member.bio,
      worksFor: { '@id': `${origin}/#organization` },
      ...(member.portrait ? { image: origin + member.portrait } : {}),
      sameAs: member.connections.map(connection => connection.url),
    });
  } else if (page.path === '/team') {
    pageSchema.mainEntity = {
      '@type': 'ItemList', name: 'The Founding Team',
      itemListElement: teamMembers.map((member, index) => ({
        '@type': 'ListItem', position: index + 1, name: member.name, url: `${origin}/team/${member.slug}`,
      })),
    };
  }
  const structuredData = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return `<title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="theme-color" content="#FFC700" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Yoo360" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${shareImage}" />
    <meta property="og:image:secure_url" content="${shareImage}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="576" />
    <meta property="og:image:height" content="303" />
    <meta property="og:image:alt" content="${shareImageAlt}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${shareImage}" />
    <meta name="twitter:image:alt" content="${shareImageAlt}" />
    <script type="application/ld+json">${structuredData}</script>`;
}

const template = await readFile('dist/index.html', 'utf8');
if (!template.includes('<!-- page-metadata:start -->') || !template.includes('<div id="root"></div>')) {
  throw new Error('The static page template is missing its metadata or rendering slot.');
}
await build({
  build: {
    ssr: 'src/prerender.tsx', outDir: 'dist-ssr', emptyOutDir: true, copyPublicDir: false,
    rollupOptions: { output: { entryFileNames: 'prerender.js' } },
  },
});
const { renderPage, teamMembers } = await import(pathToFileURL(path.resolve('dist-ssr/prerender.js')).href);
pages.splice(2, 0,
  {
    path: '/team', file: 'dist/team/index.html',
    title: 'The Founding Team | Yoo360',
    description: 'Meet the founding team behind Yoo360: Melkisedeck Ruposo, Berton Ruposo and Bertin Victoire. Explore their individual profiles and creative roles.',
    type: 'CollectionPage',
  },
  ...teamMembers.map(member => ({
    path: `/team/${member.slug}`, file: `dist/team/${member.slug}/index.html`,
    title: `${member.name} | ${member.role} | Yoo360`,
    description: member.bio,
    type: 'ProfilePage', member,
  })),
);
for (const page of pages) {
  const html = template
    .replace(/<!-- page-metadata:start -->[\s\S]*?<!-- page-metadata:end -->/, metadata(page))
    .replace('<div id="root"></div>', `<div id="root">${renderPage(page.path)}</div>`);
  await mkdir(path.dirname(page.file), { recursive: true });
  await writeFile(page.file, html);
}

const lastModified = new Date().toISOString().slice(0, 10);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter(page => !page.noindex).map(page => `  <url><loc>${origin}${page.path}</loc><lastmod>${lastModified}</lastmod></url>`).join('\n')}
</urlset>\n`);
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log('Prerendered all public pages and the 404 page; generated canonical metadata, structured data, sitemap and robots.txt.');
