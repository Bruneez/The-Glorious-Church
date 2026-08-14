import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { logStability } from '@/utils/stabilityDebug';

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    logStability('app.unhandled_rejection', {
      message: event.reason?.message || String(event.reason),
      code: event.reason?.code || null,
    });
    console.error('[app] Unhandled promise rejection', event.reason);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
