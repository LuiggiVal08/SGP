import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('404 - No Encontrada');
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-warning/[0.03] dark:bg-warning/[0.04] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/[0.02] dark:bg-primary/[0.03] blur-3xl" />
      </div>
      <div className="text-center max-w-sm relative animate-fade-in">
        <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-warning/10 flex items-center justify-center ring-1 ring-warning/20">
          <FileQuestion size={40} className="text-warning" />
        </div>
        <h1 className="text-6xl font-bold text-foreground/10 dark:text-foreground/5 leading-none mb-2 select-none">
          404
        </h1>
        <h2 className="text-2xl font-bold text-foreground mb-2 -mt-3">Página no encontrada</h2>
        <p className="text-sm text-muted mb-8">
          La página que buscas no existe o ha sido movida a otra dirección.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <ArrowLeft size={16} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
