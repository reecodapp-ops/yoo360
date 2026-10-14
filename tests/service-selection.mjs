import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
const html=await readFile('dist/order-a-design/index.html','utf8');
const cards=[...html.matchAll(/<a class="service-card"([\s\S]*?)<\/a>/g)].map(x=>x[0]);
assert.equal(cards.length,4);
for(const [i,route] of ['/order-a-design/order/logo','/order-a-design/order/graphics','/discuss-a-project?service=video','/marketing-partnerships'].entries())assert.ok(cards[i].includes(`href="${route}"`));
for(const card of cards){assert.ok(card.includes('service-card-head'));assert.ok(card.includes('service-illustration'));assert.ok(card.includes('service-title'));assert.ok(card.includes('class="from"'));}
assert.ok(!html.includes('engagement-grid')&&!html.includes('Work with Yoo360'));
const page=await readFile('dist/marketing-partnerships/index.html','utf8');
assert.equal((page.match(/class="pricing-card"/g)||[]).length,4);
assert.equal((page.match(/class="subscribe-button"/g)||[]).length,4);
for(const slug of ['starter','growth','scale','enterprise'])assert.ok(page.includes(`href="/marketing-partnerships/${slug}"`));
assert.ok(!page.includes('You Get')&&!page.includes('Duration')&&!page.includes('Included scope'));
assert.ok(page.includes('View Plan'));
assert.ok(!page.includes('One campaign or market launch')&&!page.includes('How we start')&&!page.includes('<footer')&&!page.includes('Your ongoing marketing team'));
assert.ok(page.includes('MOST<br/>CHOSEN'));assert.ok(page.includes('Save $300'));
for(const slug of ['video-motion-production','websites-digital-products']){
 const service=await readFile(`dist/${slug}/index.html`,'utf8');
 assert.ok(service.includes('Build With Us'));
 assert.ok(!service.includes('Order individual artwork')&&!service.includes('Explore monthly partnerships'));
}
const home=await readFile('dist/index.html','utf8');assert.ok(home.includes('src="/brand/yoo360-primary-white.webp"'));await access('dist/brand/yoo360-primary-white.webp');
console.log('PASS Four matching linked cards, supplied illustration assets, compact four-plan-only page, preselected monthly enquiries, unified secondary CTA and homepage logo asset.');
