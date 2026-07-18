import { type ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Decorative accent shown as a vertical bar before the title. */
  accent?: boolean;
  actions?: ReactNode;
}

/**
 * Consistent page heading with the signature accent bar, used at the top of
 * every feature view (skill: designing-beautiful-websites — clear hierarchy).
 */
export function PageHeader({ title, subtitle, accent = true, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="relative">
        {accent && (
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
        )}
        <h1 className="pl-3 text-2xl font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 pl-3 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
