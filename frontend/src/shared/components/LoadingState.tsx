import { Spinner } from '@heroui/react';

interface LoadingStateProps {
  label?: string;
  /** Use the branded splash variant (gradient mark) for full-page loads. */
  brand?: boolean;
  className?: string;
}

/**
 * Reusable loading surface. `brand` variant gives the app a distinct, on-brand
 * splash instead of a bare spinner (skill: frontend-design).
 */
export function LoadingState({ label = 'Cargando…', brand = false, className = '' }: LoadingStateProps) {
  if (brand) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background" role="status" aria-live="polite">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-2 ring-1 ring-white/10">
          <span className="font-display text-xl font-extrabold text-primary-foreground">SGP</span>
        </div>
        <p className="text-sm text-muted">{label}</p>
        <span className="sr-only">{label}</span>
      </div>
    );
  }
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} role="status" aria-live="polite">
      <Spinner size="md" aria-label={label} />
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}
