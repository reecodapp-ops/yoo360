import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { orderScreen, orderRoute, orderApi } from '../order-app/lib/routes.ts';

const origin = 'https://www.theyoo360.com';
const id = '634a4607-209d-4f44-8c98-e80e6cdd537c';
for (const [path, screen] of [
  ['', 'home'], ['/order/logo', 'logo'], ['/order/graphics', 'graphics'], ['/checkout', 'checkout'],
  [`/payment-status/${id}`, 'payment'], [`/project-brief/${id}`, 'brief'], [`/order/${id}`, 'status'],
]) {
  const route = orderRoute(path || '/');
  assert.equal(orderScreen(route)?.screen, screen);
  assert.equal(orderScreen(route + '/')?.screen, screen);
}
for (const path of ['/team', '/order-a-design-elsewhere', '/order-a-design/admin', '/order-a-design/order/../../admin', '/order-a-design/payment-status/unknown']) {
  assert.equal(orderScreen(path), null);
}
assert.equal(orderApi(`orders/${id}/brief`), `/api/design-orders/orders/${id}/brief`);

const publicPages = ['', '/order/logo', '/order/graphics'];
for (const path of [...publicPages, '/checkout', '/payment-status', '/project-brief', '/order']) {
  const html = await readFile(`dist/order-a-design${path}/index.html`, 'utf8');
  assert.ok(html.includes('name="referrer" content="no-referrer"'));
  assert.ok(html.includes('sizes="96x96"'));
  assert.ok(html.includes('https://www.theyoo360.com/brand/yoo360-og.png'));
  if (publicPages.includes(path)) {
    assert.ok(html.includes(`rel="canonical" href="${origin}/order-a-design${path}"`));
    assert.ok(html.includes('content="index, follow"'));
  } else {
    assert.ok(html.includes('content="noindex, nofollow"'));
    assert.ok(!html.includes('rel="canonical"'));
  }
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]+)"/g)) {
    if (/\.(js|css|png|webp|svg|ttf)$/.test(match[1])) await access('dist' + match[1]);
    if (!/\.(js|css|png|webp|svg|ttf)$/.test(match[1])) assert.ok(['/','/discuss-a-project','/other-enquiry','/marketing-partnerships','/video-motion-production','/websites-digital-products'].includes(match[1]) || match[1].startsWith('/order-a-design'));
  }
  assert.ok(!html.includes('href="/checkout"') && !html.includes('href="/order/logo"'));
}
const landing = await readFile('dist/order-a-design/index.html', 'utf8');
assert.ok(landing.includes('What are we building') && landing.includes('today?'));
assert.ok(landing.includes('Logo &amp; Brand Visual Identity') && landing.includes('Marketing &amp; Print Design'));
assert.ok(!landing.includes('<footer'));
const home = await readFile('dist/index.html', 'utf8');
assert.ok(home.includes('href="/order-a-design/order/logo"'));
assert.ok(!home.includes('yoo360-studio-orders.berton-thedezi.chatgpt.site'));
assert.ok(!home.includes('/order-a-design/assets/'), 'Order styles are isolated from the homepage');
assert.deepEqual(await readFile('dist/logo.png'), await readFile('dist/favicon.png'), 'Legacy icon URL serves the same square brand mark');
for (const name of ['regular', 'medium', 'semibold']) await access(`dist/fonts/poppins-${name}.ttf`);
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
assert.ok(config.rewrites.some(r => r.source === '/api/design-orders/:path*' && r.destination === 'https://yoo360-studio-orders.berton-thedezi.chatgpt.site/api/:path*'));
assert.ok(config.headers.some(r => r.source === '/api/design-orders/:path*' && r.headers.some(h => h.key === 'Cache-Control' && h.value.includes('no-store'))));
assert.ok(!config.rewrites.some(r => r.source === '/:path*'));
console.log('PASS Official-domain routes, order metadata, private-page indexing, navigation, legacy favicon, assets and isolated homepage styles.');
