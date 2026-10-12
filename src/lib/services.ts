export type ServicePage = {
  slug: string; title: string; intro: string; outputs: string[]; service: string;
  next: string; nextHref?: string;
};
export const servicePages: ServicePage[] = [
  { slug: 'brand-strategy-identity', title: 'Brand Strategy & Identity', service: 'brand',
    intro: 'We study your customers, shape your positioning and build a brand people understand, recognize and choose.',
    outputs: ['Customer and market understanding', 'Brand positioning and messaging', 'Logo and visual identity systems', 'Packaging and brand rollout'],
    next: 'Discuss your brand project' },
  { slug: 'campaigns-market-launches', title: 'Campaigns & Market Launches', service: 'campaigns',
    intro: 'Prepare your brand for the market. We connect customer insight, local context and creative execution to help your product reach the people it is built for.',
    outputs: ['Customer and market research', 'Messaging tailored to your audience', 'Campaign concepts and creative production', 'Launch planning and campaign execution'],
    next: 'Discuss your campaign' },
  { slug: 'websites-digital-products', title: 'Websites & Digital Products', service: 'digital',
    intro: 'Websites, apps and digital tools shaped around your business and the people using them. Share your goals and required features so we can prepare an accurate proposal.',
    outputs: ['Business websites and ecommerce', 'Mobile apps and marketplaces', 'Customer journeys and interface design', 'Development, launch and agreed support'],
    next: 'Request a project quote' },
  { slug: 'video-motion-production', title: 'Video & Motion Production', service: 'video',
    intro: 'From filmed content and animation to brand films and documentaries. Tell us what you need, and our production team will propose the scope and quote.',
    outputs: ['Video editing and social content', 'Motion graphics and animated stories', 'Product videos and brand films', 'Documentaries and campaign production'],
    next: 'Request a production quote' },
];
export const servicePath = (service: ServicePage) => '/' + service.slug;
export function enquiryLink(service: string, plan = '') {
  const params = new URLSearchParams({ service });
  if (plan) { params.set('plan', plan); params.set('type', 'monthly'); }
  return '/discuss-a-project?' + params;
}
export const partnershipPlans = [
  { slug: 'starter', name: 'Starter', subtitle: 'Content Engine', monthly: 2000, saving: 0,
    goal: 'Build a clear, professional brand presence with consistent creative output.',
    inclusions: ['10 graphic artworks per month', '7 short-form videos per month', 'Up to 2 active requests at a time', '2 revisions per artwork', '1 revision per video', 'Dedicated creative team'],
    audience: 'New and growing brands needing consistency and credibility.', duration: '2 to 3 months' },
  { slug: 'growth', name: 'Growth', subtitle: 'Performance Engine', monthly: 4500, saving: 675, mostChosen: true,
    goal: 'Turn creative content into a scalable growth and conversion system.',
    inclusions: ['15 graphic artworks per month', '10 videos per month', 'Up to 3 active requests at a time', '3 revisions per artwork', '2 revisions per video', 'Dedicated creative team', 'Digital asset production', 'Ad campaign setup and management for Meta and Google', 'Website content updates and optimization'],
    audience: 'Brands ready to scale reach, leads and sales.', duration: '3 to 6 months' },
  { slug: 'scale', name: 'Scale', subtitle: 'Marketing Ownership', monthly: 7000, saving: 1050,
    goal: 'Lead your market with integrated campaigns and full marketing execution.',
    inclusions: ['25 graphic artworks per month', '20 videos per month', 'Up to 4 active requests at a time', '3 revisions per artwork', '2 revisions per video', 'Dedicated creative team', 'Campaign-level creative and video production', 'Your website fully managed by Yoo360, with ownership retained by you', 'Ad campaign management included'],
    audience: 'Established brands seeking market authority.', duration: '6 to 9 months' },
  { slug: 'enterprise', name: 'Enterprise', subtitle: 'Full Marketing Control', monthly: 10000, saving: 1500,
    goal: 'Operate and scale your entire creative and marketing ecosystem.',
    inclusions: ['45 graphic artworks per month', '40 videos per month', 'Up to 6 active requests at a time', '3 revisions per artwork', '2 revisions per video', 'Dedicated creative and marketing team', 'Weekly planning and execution sessions', 'Ad campaign management and agreed ad spend included', 'Website performance, optimization and updates handled', 'Support for multiple brands or businesses'],
    audience: 'Corporates, groups and portfolios with multiple brands.', duration: '9 to 12 months' },
];
export type PartnershipPlan = typeof partnershipPlans[number];
export const planPath = (plan: PartnershipPlan) => '/marketing-partnerships/' + plan.slug;
export const usd = (amount: number) => '$' + amount.toLocaleString('en-US');
