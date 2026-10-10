// Read-only connectivity check. It never creates an order or initiates payment.
export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ available: false });
  }
  try {
    const upstream = await fetch('https://yoo360-studio-orders.berton-thedezi.chatgpt.site/api/payment-config', {
      signal: AbortSignal.timeout(15000),
      redirect: 'error',
    });
    if (!upstream.ok || !upstream.headers.get('content-type')?.includes('application/json')) {
      return response.status(503).json({ available: false });
    }
    const configuration = await upstream.json();
    return response.status(200).json({ available: true, mode: configuration.mode });
  } catch {
    return response.status(503).json({ available: false });
  }
}
