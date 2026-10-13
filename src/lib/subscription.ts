import { usd, type PartnershipPlan } from './services';
export const subscriptionLink = (plan: PartnershipPlan) => `/discuss-a-project?service=partnerships&plan=${plan.slug}&type=monthly&subscription=1`;
export function subscriptionMessage(plan: PartnershipPlan) {
 return [
  `Hello Yoo360,`,
  `I would like to discuss the ${plan.name} monthly marketing partnership (${plan.subtitle}).`,
  `Monthly price: ${usd(plan.monthly)}${plan.slug === 'enterprise' ? '+, with final scope to be agreed' : ''}.`,
  `Objective: ${plan.goal}`,
  `Included scope:`,
  ...plan.inclusions.map(item => `• ${item}`),
  `Ideal for: ${plan.audience}`,
  `Recommended duration: ${plan.duration}.`,
  `Optional 3-month commitment: save ${usd(plan.saving)} per month (${usd(plan.monthly-plan.saving)}${plan.slug==='enterprise'?'+':''} per month).`,
  `Please contact me to confirm the scope, availability and agreement before starting.`,
 ].join('\n\n');
}
