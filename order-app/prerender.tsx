import { renderToStaticMarkup } from 'react-dom/server';
import { YooApp } from './components/yoo/app';
export function renderOrderPage(screen: string) {
  return renderToStaticMarkup(<YooApp screen={screen} {...(['payment', 'brief', 'status'].includes(screen) ? { id: 'pending' } : {})} />);
}
