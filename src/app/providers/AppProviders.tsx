import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import type { PropsWithChildren } from 'react';

interface AppProvidersProps extends PropsWithChildren {
  queryClient: QueryClient;
}

export const AppProviders = ({ children, queryClient }: AppProvidersProps) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
