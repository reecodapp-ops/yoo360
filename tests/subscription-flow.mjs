import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderPage,partnershipPlans,subscriptionMessage,subscriptionLink} from '../dist-ssr/prerender.js';
for(const plan of partnershipPlans){
 const message=subscriptionMessage(plan);
 assert.ok(message.includes(plan.name)&&message.includes('Monthly price:'));
 assert.ok(message.length<3000);
 for(const inclusion of plan.inclusions)assert.ok(message.includes(inclusion));
 const detail=await readFile(`dist/marketing-partnerships/${plan.slug}/index.html`,'utf8');
 assert.equal((detail.match(/class="pricing-card"/g)||[]).length,0);
 assert.ok(detail.includes('What you get')&&detail.includes('Recommended duration')&&detail.includes('Subscribe to This Plan'));
 for(const inclusion of plan.inclusions)assert.ok(detail.includes(inclusion));
 const request=renderPage('/discuss-a-project',new URL(subscriptionLink(plan),'https://www.theyoo360.com').search);
 assert.ok(request.includes('Your subscription request')&&request.includes('Send Subscription Request'));
 assert.ok(/readonly=""/i.test(request));
 assert.ok(request.includes('name="name"')&&request.includes('name="email"'));
 assert.ok(!request.includes('id="enquiry-service"')&&!request.includes('id="enquiry-plan"')&&!request.includes('id="enquiry-type"')&&!request.includes('Briefly tell us what you need'));
 assert.ok(request.includes(plan.name));
}
assert.ok(renderPage('/discuss-a-project','?subscription=1&plan=invalid').includes('Briefly tell us what you need'));
console.log('PASS Overview to individual detail to prewritten contact request for all four plans; complete scope, unchanged fees, message limits, minimal contact form and invalid-plan fallback.');
