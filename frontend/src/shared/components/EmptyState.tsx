import type { ReactNode } from 'react';

interface EmptyStateProps {
  message?: string;
  hint?: string;
  icon?: ReactNode;
}

export function EmptyState({ message = 'Sin datos', hint, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/5 text-primary/70 ring-1 ring-inset ring-primary/10">
        {icon ?? (
          <svg viewBox="0 0 120 120" fill="none" className="w-9 h-9 text-primary/60" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="40" width="80" height="60" rx="6" stroke="currentColor" strokeWidth="3" />
            <path d="M20 45L40 30h40l20 15" stroke="currentColor" strokeWidth="3" />
            <line x1="35" y1="65" x2="85" y2="65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">{message}</p>
      {hint && <p className="mt-1 max-w-xs text-xs text-muted">{hint}</p>}
    </div>
  );
}
