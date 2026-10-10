export const ORDER_BASE = '/order-a-design';
export const ORDER_API_BASE = '/api/design-orders';

export function orderRoute(path: string) {
  return ORDER_BASE + (path === '/' ? '' : path);
}

export function orderApi(path: string) {
  return ORDER_API_BASE + '/' + path;
}

export function orderScreen(path: string): { screen: string; id?: string } | null {
  const relative = path.replace(/\/$/, '').slice(ORDER_BASE.length);
  if (path !== ORDER_BASE && !path.startsWith(ORDER_BASE + '/')) return null;
  const screens: Record<string, string> = { '': 'home', '/order/logo': 'logo', '/order/graphics': 'graphics', '/checkout': 'checkout' };
  if (screens[relative]) return { screen: screens[relative] };
  const match = relative.match(/^\/(payment-status|project-brief|order)\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})$/);
  return match ? { screen: { 'payment-status': 'payment', 'project-brief': 'brief', 'order': 'status' }[match[1]]!, id: match[2] } : null;
}
