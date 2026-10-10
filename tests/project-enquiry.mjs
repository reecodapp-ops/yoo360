import assert from 'node:assert/strict';
import { sendProjectEnquiry } from '../src/lib/project-enquiry.ts';

let request;
await sendProjectEnquiry('https://example.test/api', { requestKey: 'test-key' }, async (url, options) => { request = { url, options }; return Response.json({ accepted: true }); });
assert.equal(request.options.credentials, 'omit'); assert.equal(request.options.method, 'POST');
for (const response of [Response.json({ accepted: false }), Response.json({ error: 'Delivery unavailable' }, { status: 503 }), new Response('not JSON', { status: 200 })])
    await assert.rejects(() => sendProjectEnquiry('https://example.test/api', {}, async () => response));
await assert.rejects(() => sendProjectEnquiry('https://example.test/api', {}, async () => { throw new Error('offline'); }));
console.log('PASS The form confirms only accepted enquiries; server, malformed-response and network failures remain errors.');
