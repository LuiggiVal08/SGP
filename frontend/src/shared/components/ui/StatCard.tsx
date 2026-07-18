import { type ComponentType, type SVGProps } from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'accent';
  loading?: boolean;
  formatValue?: (value: number | string) => string;
}

const accentMap = {
  primary: { icon: 'bg-primary/12 text-primary', bar: 'from-primary/50 to-primary/10', border: 'border-primary/25', glow: 'hover:shadow-primary/20', wash: 'from-primary/[0.06]' },
  success: { icon: 'bg-success/12 text-success', bar: 'from-success/50 to-success/10', border: 'border-success/25', glow: 'hover:shadow-success/20', wash: 'from-success/[0.06]' },
  warning: { icon: 'bg-warning/12 text-warning', bar: 'from-warning/50 to-warning/10', border: 'border-warning/25', glow: 'hover:shadow-warning/20', wash: 'from-warning/[0.06]' },
  danger: { icon: 'bg-danger/12 text-danger', bar: 'from-danger/50 to-danger/10', border: 'border-danger/25', glow: 'hover:shadow-danger/20', wash: 'from-danger/[0.06]' },
  accent: { icon: 'bg-accent/12 text-accent', bar: 'from-accent/50 to-accent/10', border: 'border-accent/25', glow: 'hover:shadow-accent/20', wash: 'from-accent/[0.06]' },
} as const;

/**
 * KPI tile used on the dashboard and other metric surfaces. Single source of
 * truth for stat-card styling (skill: designing-beautiful-websites).
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'primary',
  loading = false,
  formatValue = (v) => String(v),
}: StatCardProps) {
  const a = accentMap[accent];
  return (
    <div
      className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border ${a.border} bg-surface/70 p-4 backdrop-blur-xl shadow-1 transition-all duration-200 hover:-translate-y-1 hover:shadow-3 ${a.glow}`}
    >
      <div className={`pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${a.wash} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${a.bar} group-hover:h-[3px] transition-all duration-200`} />
      <div
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl ${a.icon} ring-1 ring-inset ring-current/10 transition-transform duration-200 group-hover:scale-110`}
      >
        <Icon size={18} />
      </div>
      {loading ? (
        <div className="relative space-y-2">
          <div className="h-8 w-20 animate-pulse rounded-lg bg-surface-secondary" />
          <div className="h-3 w-24 rounded bg-surface-secondary" />
        </div>
      ) : (
        <div className="relative">
          <p className="font-display text-2xl font-bold tracking-tight text-foreground">
            {formatValue(value)}
          </p>
          <p className="text-xs font-medium text-muted">{label}</p>
        </div>
      )}
    </div>
  );
}
