/* eslint-disable react-refresh/only-export-components */
import { Suspense, type ReactNode } from 'react';
import { Spinner } from '@heroui/react';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" aria-label="Cargando página" />
    </div>
  );
}

export function suspense(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}
