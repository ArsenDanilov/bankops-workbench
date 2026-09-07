import { StrictMode } from 'react';
import { AppProviders } from './app/providers/AppProviders';
import { createAppQueryClient } from './app/providers/queryClient';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './app/router/AppRouter';
import './app/styles/reset.css';
import './app/styles/tokens.css';
import './app/styles/globals.css';

const queryClient = createAppQueryClient();

const enableMocking = async () => {
  if (!import.meta.env.DEV) return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
};

void enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders queryClient={queryClient}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AppProviders>
    </StrictMode>,
  );
});
