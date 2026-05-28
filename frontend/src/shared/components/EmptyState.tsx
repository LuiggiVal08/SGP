import type { ReactNode } from 'react';

interface EmptyStateProps {
  message?: string;
  icon?: ReactNode;
}

export function EmptyState({ message = 'Sin datos', icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted">
      {icon ?? (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-muted/60">
          <rect x="20" y="40" width="80" height="60" rx="6" stroke="currentColor" strokeWidth="2" />
          <path d="M20 45L40 30h40l20 15" stroke="currentColor" strokeWidth="2" />
          <line x1="35" y1="65" x2="85" y2="65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="45" y1="77" x2="75" y2="77" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="95" cy="25" r="8" fill="currentColor" opacity="0.15" />
          <circle cx="75" cy="20" r="4" fill="currentColor" opacity="0.1" />
        </svg>
      )}
      <p className="mt-4 text-sm">{message}</p>
    </div>
  );
}
