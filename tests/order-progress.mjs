import assert from 'node:assert/strict';
import { checkoutFingerprint, parseOrderProgress, matchingOrderProgress } from '../order-app/lib/order-progress.ts';

const cart = { service: 'graphics', mode: 'bundle', addons: [], artworks: [{ id: 'artwork-a', name: 'Event flyer', print: true, message: false, priority: false }], production: { enabled: false, location: '', item: '', quantity: '', material: '', notes: '' } };
const customer = { name: 'Preview Client', business: 'QA Studio', individual: false, country: 'RWA', provider: '', phone: '0783456789' };
const fingerprint = checkoutFingerprint(cart, customer, 60, '250783456789');
const progress = { id: '634a4607-209d-4f44-8c98-e80e6cdd537c', fingerprint, briefUnlocked: false };
const saved = parseOrderProgress(JSON.stringify(progress));
assert.equal(matchingOrderProgress(saved, checkoutFingerprint({ ...cart }, { ...customer, phone: '+250783456789' }, 60, '250783456789'))?.id, progress.id);
assert.equal(matchingOrderProgress(saved, checkoutFingerprint({ ...cart, artworks: [{ ...cart.artworks[0], priority: true }] }, customer, 60, '250783456789')), null);
assert.equal(matchingOrderProgress(saved, checkoutFingerprint(cart, customer, 100, '250783456789')), null);
assert.equal(matchingOrderProgress(saved, checkoutFingerprint(cart, customer, 60, '250788888888')), null);
assert.equal(matchingOrderProgress(saved, fingerprint)?.briefUnlocked, false);
assert.equal(matchingOrderProgress({ ...saved, briefUnlocked: true }, fingerprint)?.briefUnlocked, true);
assert.equal(parseOrderProgress('{broken'), null);
assert.equal(parseOrderProgress(JSON.stringify({ ...progress, id: '../../admin' })), null);
console.log('PASS: returning to unchanged checkout resumes its order; changed options, amount or wallet starts a fresh checkout; brief availability and invalid stored state are handled.');
