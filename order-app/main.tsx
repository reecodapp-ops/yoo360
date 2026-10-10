import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { YooApp } from './components/yoo/app';
import { SiteMotion } from './components/yoo/site-motion';
import { orderScreen } from './lib/routes';
import 'lenis/dist/lenis.css';
import './styles.css';

const route = orderScreen(window.location.pathname);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {route ? <><YooApp {...route} /><SiteMotion /></> : <main className="shell state-wrap"><h1>Page not found</h1><a className="secondary" href="/order-a-design">Back to designs</a></main>}
  </StrictMode>,
);
