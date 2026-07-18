import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from 'react-router-dom';
import { LoadingState } from './shared/components/LoadingState.tsx';
import { router } from './routes/index.tsx';
import { useAuthStore } from './shared/store/auth.store.ts';
import { SessionTimer } from './shared/components/SessionTimer.tsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

useAuthStore.getState().hydrate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
       <Suspense fallback={<LoadingState brand label="Cargando aplicación" />}>
        <RouterProvider router={router} />
      </Suspense>
      <SessionTimer />
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  </StrictMode>,
);
