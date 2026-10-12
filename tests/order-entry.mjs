import assert from 'node:assert/strict';
import { initialCart, price } from '../order-app/lib/catalog.ts';
import { cartForOrderEntry } from '../order-app/lib/order-entry.ts';

const draft = { ...initialCart(), service: 'graphics', addons: ['card', 'source'], production: { ...initialCart().production, enabled: true, item: 'Old project' } };
const basic = cartForOrderEntry(draft, 'logo', '?mode=basic', initialCart);
assert.equal(basic.service, 'logo');
assert.equal(basic.mode, 'basic');
assert.equal(price(basic), 14999);
assert.deepEqual(basic.addons, []);
assert.equal(basic.production.enabled, false);
const bundle = cartForOrderEntry(draft, 'logo', '?mode=bundle', initialCart);
assert.equal(bundle.mode, 'bundle');
assert.equal(price(bundle), 49999);
assert.deepEqual(bundle.addons, []);
for (const search of ['', '?mode=unknown', '?mode=', '?mode=BASIC']) {
    const resumed = cartForOrderEntry(draft, 'logo', search, initialCart);
    assert.equal(resumed.service, 'logo');
    assert.deepEqual(resumed.addons, draft.addons);
    assert.equal(resumed.production, draft.production);
}
assert.equal(cartForOrderEntry(draft, 'checkout', '?mode=basic', initialCart), draft);
assert.deepEqual(cartForOrderEntry(draft, 'graphics', '?mode=basic', initialCart), draft);
console.log('PASS Package entry links select the advertised price without old extras; regular and invalid links preserve the draft.');

const oldDraft = { ...draft }; delete oldDraft.catalogVersion;
const refreshed = cartForOrderEntry(oldDraft, 'checkout', '', initialCart);
assert.equal(refreshed.catalogVersion, initialCart().catalogVersion);
assert.deepEqual(refreshed.artworks, oldDraft.artworks);
