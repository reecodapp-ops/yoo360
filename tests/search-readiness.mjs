import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

const origin = 'https://www.theyoo360.com';
const cases = [
  ['dist/index.html', '/', 'We design'],
  ['dist/discuss-a-project/index.html', '/discuss-a-project', 'Discuss a'],
  ['dist/other-enquiry/index.html', '/other-enquiry', 'Tell us what you'],
  ['dist/marketing-partnerships/index.html', '/marketing-partnerships', 'Build. Grow.'],
  ...['starter', 'growth', 'scale', 'enterprise'].map(slug => [`dist/marketing-partnerships/${slug}/index.html`, '/marketing-partnerships/' + slug, slug[0].toUpperCase() + slug.slice(1) + ' partnership.']),
  ...[['websites-digital-products', 'Websites &amp; Digital Products'], ['video-motion-production', 'Video &amp; Motion Production']].map(([slug, title]) => [`dist/${slug}/index.html`, '/' + slug, title]),
  ['dist/about/index.html', '/about', 'About '],
  ['dist/team/index.html', '/team', 'The Founding Team'],
  ['dist/team/melkisedeck-ruposo/index.html', '/team/melkisedeck-ruposo', 'Melkisedeck Ruposo'],
  ['dist/team/berton-ruposo/index.html', '/team/berton-ruposo', 'Berton Ruposo Mwisha'],
  ['dist/team/bertin-victoire/index.html', '/team/bertin-victoire', 'Bertin Victoire'],
];
const titles = new Set();
for (const [file, route, heading] of cases) {
  const html = await readFile(file, 'utf8');
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  assert.ok(title, `${route} has a title`);
  assert.ok(!titles.has(title), 'Each page has a distinct title');
  titles.add(title);
  const body = html.split('<body>')[1];
  assert.ok(body.includes('<h1') && body.includes(heading), `${route} is readable without JavaScript`);
  assert.ok(!/style="[^"]*opacity:\s*0(?:;|")/.test(body), 'Prerendered text is visible before JavaScript runs');
  assert.ok(html.includes(`<link rel="canonical" href="${origin}${route}"`));
  assert.ok(html.includes(`<meta property="og:url" content="${origin}${route}"`));
  assert.ok(html.includes('content="index, follow, max-image-preview:large"'));
  assert.equal((html.match(/name="description"/g) || []).length, 1);
  assert.ok(html.match(/name="description" content="([^"]+)"/)[1].replace(/&amp;/g,'&').length < 160);
  assert.equal((body.match(/<h1(?: |\>)/g)||[]).length,1);
  assert.ok(html.includes(`<meta property="og:image" content="${origin}/brand/yoo360-og.png"`));
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(html.includes('sizes="96x96" href="/favicon.png"'));
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1] || 'null');
  assert.equal(schema['@context'], 'https://schema.org');
  assert.ok(schema['@graph'].some(item => item['@type'] === 'Organization' && item.name === 'Yoo360'));
  assert.ok(schema['@graph'].some(item => item.url === origin + route && item.isPartOf));
  if (route.startsWith('/team/')) {
    const profile = schema['@graph'].find(item => item['@type'] === 'ProfilePage');
    const person = schema['@graph'].find(item => item['@type'] === 'Person');
    assert.ok(profile && person, `${route} includes a person profile`);
    assert.equal(profile.mainEntity['@id'], person['@id']);
    assert.equal(person.name, heading);
    assert.ok(body.includes(person.description), 'The structured biography is visible on the profile');
    for (const social of person.sameAs) assert.ok(body.includes(`href="${social}"`), 'Person links match visible connections');
  }
  for (const match of html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)) {
    if (match[1].startsWith('/assets/') || /\.(png|svg|webmanifest)$/.test(match[1])) {
      await access('dist' + match[1]);
    }
  }
}
const home = await readFile('dist/index.html', 'utf8');
assert.ok(home.includes('what <em') && home.includes('We build'), 'The homepage headline keeps both complete thoughts');
assert.ok(home.includes('<title>Yoo360 | Brand &amp; Digital Agency | Turn Attention Into Sales</title>'));
assert.ok(home.includes('We shape your offer, strengthen your brand and create campaigns and digital tools that reach customers.'));
for (const service of ['Brand Strategy &amp; Identity', 'Video &amp; Motion Production', 'Marketing Partnerships', 'Websites &amp; Digital Products']) {
  assert.ok(home.toLowerCase().split('<body>')[1].includes(service.toLowerCase()), `${service} is present in page content`);
}
assert.ok(home.includes('>72</span>'), 'Project count is correct before JavaScript runs');
const robots = await readFile('dist/robots.txt', 'utf8');
assert.ok(robots.includes('User-agent: *\nAllow: /'));
assert.ok(!/^Disallow: \/$/m.test(robots));
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.deepEqual([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]).sort(), [...cases.map(([, route]) => origin + route), ...['/order-a-design', '/order-a-design/order/logo', '/order-a-design/order/graphics'].map(route => origin + route)].sort());
const missing = await readFile('dist/404.html', 'utf8');
assert.ok(missing.includes('content="noindex, follow"'));
assert.ok(!missing.includes('rel="canonical"'));
await access('dist/icon-512.png');
const listing = await readFile('dist/team/index.html', 'utf8');
const cards = listing.match(/<ul[^>]+id="founding-team-cards"[\s\S]*?<\/ul>/)?.[0];
assert.ok(cards, 'The founding team listing contains all three members');
assert.equal((cards.match(/<a /g) || []).length, 3, 'Each member has one whole-card link');
assert.equal((cards.match(/<h3 /g) || []).length, 3);
assert.equal((cards.match(/<p /g) || []).length, 3, 'The only card paragraph is its role');
assert.equal((cards.match(/<img /g) || []).length, 3, 'All cards have a real portrait');
assert.ok(!cards.includes('<svg') && !cards.includes('linkedin.com') && !cards.includes('instagram.com'), 'No connection icons or links appear on the cards');
for (const file of cases.filter(([, route]) => route.startsWith('/team/')).map(([file]) => file)) {
  const html = await readFile(file, 'utf8');
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)[1]);
  const person = schema['@graph'].find(item => item['@type'] === 'Person');
  assert.ok(person.image?.startsWith(`${origin}/assets/team/`));
  await access('dist' + person.image.slice(origin.length));
  assert.ok(!cards.includes(person.description), 'Each biography belongs only on its individual profile');
  assert.ok(html.includes('Back to Team'));
}
const header = home.match(/<header[\s\S]*?<\/header>/)?.[0];
assert.ok(!header.includes('href="/team"'), 'The team entry does not alter the header navigation');
const studio = home.match(/<section[^>]+id="studio"[\s\S]*?<\/section>/)?.[0];
assert.ok(studio?.includes('href="/team"') && studio.includes('Meet the team'), 'The studio section links to the team');
const footer = home.match(/<footer[\s\S]*?<\/footer>/)?.[0];
assert.ok(!footer.includes('href="/team"'), 'The team entry has moved out of the footer');
const shareImage = await readFile('dist/brand/yoo360-og.png');
assert.equal(shareImage.readUInt32BE(16), 576);
assert.equal(shareImage.readUInt32BE(20), 303);
console.log('PASS All eighteen public pages contain visible HTML, valid metadata and schema, working assets, the supplied sharing image and canonical sitemap entries; the error page is excluded from indexing.');
