import assert from 'node:assert/strict';
import { ADDONS, CATALOG_VERSION, initialCart, price, amounts, artworkPrice, lines, orderLines } from '../order-app/lib/catalog.ts';
const cart = initialCart();
assert.equal(CATALOG_VERSION, cart.catalogVersion);
assert.equal(price(cart), 49999);
assert.deepEqual(amounts(price(cart), 60), { total: 49999, due: 29999, balance: 20000 });
assert.deepEqual(amounts(14999, 60), { total: 14999, due: 8999, balance: 6000 });
assert.equal(price({ ...cart, mode: 'basic', addons: [] }), 14999);
assert.equal(price({ ...cart, mode: 'basic', addons: ADDONS.map(a => a.id) }), 49999);
const expected = [4000, 6000, 6000, 8000, 5900, 7900, 7900, 9900];
for (let combination = 0; combination < 8; ++combination) {
 const art = { ...cart.artworks[0], print: !!(combination & 1), message: !!(combination & 2), priority: !!(combination & 4) };
 assert.equal(artworkPrice(art), expected[combination]);
 const selection = { ...cart, service: 'graphics', artworks: [art] };
 assert.equal(price(selection), expected[combination]);
 assert.equal(lines(selection).reduce((sum, line) => sum + line.cents, 0), price(selection));
 if (art.priority) assert.ok(lines(selection)[0].detail.includes('Rush Delivery (Under 6 hours)'));
 assert.equal(price({ ...selection, production: { ...selection.production, enabled: true } }), expected[combination]);
}
for (let combination = 0; combination < (1 << ADDONS.length); ++combination) {
 const selection = { ...cart, mode: 'basic', addons: ADDONS.filter((_, i) => combination & (1 << i)).map(a => a.id) };
 assert.equal(lines(selection).reduce((sum, line) => sum + line.cents, 0), price(selection));
}
assert.deepEqual(amounts(9900, 60), { total: 9900, due: 5940, balance: 3960 });
const legacy = { ...cart }; delete legacy.catalogVersion;
assert.equal(orderLines(legacy)[0].cents, 19990);
assert.equal(orderLines({ ...legacy, mode: 'basic', addons: ADDONS.map(a => a.id) }).reduce((sum, line) => sum + line.cents, 0), 29990);
assert.equal(orderLines({ ...legacy, service: 'graphics', artworks: [{ ...cart.artworks[0], print: true, message: true, priority: true }] })[0].cents, 3000);
assert.equal(orderLines(cart)[0].cents, 49999);
console.log('PASS All artwork combinations, 1,024 identity selections, printing exclusion, cent rounding and accepted legacy order prices.');
