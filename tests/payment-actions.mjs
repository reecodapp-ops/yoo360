import assert from 'node:assert/strict';
import { checkInitialPayment, retryInitialPayment, hasAcceptedPrompt } from '../order-app/lib/payment-actions.ts';

const id = 'private-order';
const pending = (mode = 'live', accepted = true) => ({ paymentMode: mode, paymentStatus: 'PENDING', paid: 0, due: 1800, payments: [{ purpose: 'initial', promptAccepted: accepted }] });
function wallet(states, responses = {}) {
    const calls = [];
    const api = async (path, method = 'GET', body, key) => {
        calls.push({ path, method, body, key });
        assert.equal(key, id, 'Every payment action requires the private order key');
        if (method === 'GET') return states.length > 1 ? states.shift() : states[0];
        if (responses[path] instanceof Error) throw responses[path];
        return responses[path] || {};
    };
    return { api, calls };
}
let checks = 0;
const pass = label => { ++checks; console.log('PASS ' + label); };
for (const mode of ['live', 'sandbox']) {
    const { api, calls } = wallet([pending(mode)]);
    assert.equal((await checkInitialPayment(api, id, mode)).paid, 0);
    assert.deepEqual(calls.map(c => c.path), [`orders/${id}/verify`, `orders/${id}`]);
    assert.ok(calls.every(c => !c.path.endsWith('/demo') && !c.path.endsWith('/payment')));
}
pass('A self-reported live or sandbox completion only verifies the provider; it cannot mark an order paid or send another charge');
{
    const completed = { ...pending('demo'), paid: 1800, paymentStatus: 'COMPLETED' };
    const { api, calls } = wallet([completed]);
    assert.equal((await checkInitialPayment(api, id, 'demo')).paid, 1800);
    assert.equal(calls[0].path, `orders/${id}/demo`);
    assert.deepEqual(calls[0].body, { status: 'COMPLETED' });
    pass('Explicit demo completion uses only the guarded simulation endpoint');
}
{
    const { api, calls } = wallet([pending()]);
    const result = await retryInitialPayment(api, id, () => { throw new Error('No quote should be requested'); });
    assert.match(result.message, /already active/);
    assert.ok(calls.every(c => !c.path.endsWith('/payment')));
    pass('Resending an accepted pending request checks its status and never creates another active collection');
}
{
    const { api, calls } = wallet([pending('live', false), pending('live', true)]);
    await retryInitialPayment(api, id, () => true);
    assert.ok(calls.every(c => !c.path.endsWith('/payment')));
    pass('A previously uncertain request found by verification cannot be resubmitted');
}
{
    const { api, calls } = wallet([pending('live', false)]);
    await retryInitialPayment(api, id, () => { throw new Error('Reuse the saved payment amount'); });
    assert.equal(calls.filter(c => c.path.endsWith('/payment')).length, 1);
    assert.deepEqual(calls.find(c => c.path.endsWith('/payment')).body, { purpose: 'initial', quoteId: undefined });
    pass('An unaccepted uncertain request retries through the server using its existing transaction');
}
{
    const paid = { ...pending(), paid: 1800, paymentStatus: 'COMPLETED' };
    const { api, calls } = wallet([pending(), paid]);
    assert.equal((await retryInitialPayment(api, id, () => true)).order.paid, 1800);
    assert.ok(calls.every(c => !c.path.endsWith('/payment')));
    pass('Payment confirmed during a retry stops the retry immediately');
}
for (const accepted of [false, true]) {
    const failed = { ...pending(), paymentStatus: 'TIMED_OUT' };
    const { api, calls } = wallet([failed], { [`orders/${id}/payment-quote`]: { quoteId: 'current-quote', amount: '25000', currency: 'RWF' } });
    await retryInitialPayment(api, id, quote => { assert.equal(quote.currency, 'RWF'); return accepted; });
    const charge = calls.find(c => c.path.endsWith('/payment'));
    assert.equal(!!charge, accepted);
    if (charge) assert.deepEqual(charge.body, { purpose: 'initial', quoteId: 'current-quote' });
}
pass('Expired requests require an approved current local-currency quote; canceling never initiates payment');
{
    const { api, calls } = wallet([pending()], { [`orders/${id}/verify`]: new Error('Provider unavailable') });
    await assert.rejects(retryInitialPayment(api, id, () => true), /Provider unavailable/);
    assert.ok(calls.every(c => !c.path.endsWith('/payment')));
    pass('An unavailable provider blocks retries rather than risking a second charge');
}
assert.equal(hasAcceptedPrompt({ ...pending(), payments: [{ purpose: 'initial', promptAccepted: false }, { purpose: 'balance', promptAccepted: true }] }), false);
pass('Only acceptance of the current initial payment can display the phone-request confirmation');
console.log(`All ${checks} payment action checks passed.`);
