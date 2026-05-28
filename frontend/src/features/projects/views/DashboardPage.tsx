import { Card } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/store/auth.store';
import { projectService } from '../services/project.service';
import { ProjectsTable } from '../components/ProjectsTable';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CheckCircle2, Clock, XCircle, FolderKanban, TrendingUp, TrendingDown } from 'lucide-react';
import type { ProjectStatus } from '../types/project.types';

const statusColors: Record<ProjectStatus, string> = {
  COMPLETED: '#22c55e',
  PENDING_VALIDATION: '#f59e0b',
  REJECTED: '#ef4444',
};

const statusLabels: Record<ProjectStatus, string> = {
  COMPLETED: 'Completados',
  PENDING_VALIDATION: 'Pendientes',
  REJECTED: 'Rechazados',
};

const statCards = [
  {
    key: 'total',
    label: 'Total Proyectos',
    icon: FolderKanban,
    iconBg: 'bg-primary/10 text-primary',
    barGradient: 'from-primary/40 to-primary/10',
    border: 'border-primary/20',
    change: '+12%',
    trend: 'up' as const,
  },
  {
    key: 'COMPLETED',
    label: 'Completados',
    icon: CheckCircle2,
    iconBg: 'bg-success/10 text-success',
    barGradient: 'from-success/40 to-success/10',
    border: 'border-success/20',
    change: '+8%',
    trend: 'up' as const,
  },
  {
    key: 'PENDING_VALIDATION',
    label: 'Pendientes',
    icon: Clock,
    iconBg: 'bg-warning/10 text-warning',
    barGradient: 'from-warning/40 to-warning/10',
    border: 'border-warning/20',
    change: '-3%',
    trend: 'down' as const,
  },
  {
    key: 'REJECTED',
    label: 'Rechazados',
    icon: XCircle,
    iconBg: 'bg-danger/10 text-danger',
    barGradient: 'from-danger/40 to-danger/10',
    border: 'border-danger/20',
    change: '-5%',
    trend: 'down' as const,
  },
];

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface/80 backdrop-blur-xl border border-border/50 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

function formatNumber(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getAll,
  });

  const counts = {
    total: projects.length,
    COMPLETED: projects.filter((p) => p.status === 'COMPLETED').length,
    PENDING_VALIDATION: projects.filter((p) => p.status === 'PENDING_VALIDATION').length,
    REJECTED: projects.filter((p) => p.status === 'REJECTED').length,
  };

  const pieData = (['COMPLETED', 'PENDING_VALIDATION', 'REJECTED'] as ProjectStatus[])
    .filter((s) => counts[s] > 0)
    .map((s) => ({ name: statusLabels[s], value: counts[s], color: statusColors[s] }));

  const yearData = Array.from(
    projects.reduce((map, p) => {
      map.set(p.year, (map.get(p.year) ?? 0) + 1);
      return map;
    }, new Map<number, number>()),
    ([year, count]) => ({ year, count }),
  ).sort((a, b) => a.year - b.year);

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buenos días' : currentHour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-muted font-normal">{greeting}, </span>
            {user?.firstName ?? 'Usuario'}
          </h1>
          <p className="text-sm text-muted mt-0.5">Resumen general del sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ key, label, icon: Icon, iconBg, barGradient, border, change, trend }) => (
          <Card.Root
            key={key}
            variant="secondary"
            className={`relative border ${border} bg-surface/70 backdrop-blur-xl shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 overflow-hidden`}
          >
            <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${barGradient}`} />
            <Card.Content className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${iconBg} ring-1 ring-inset ring-current/10`}>
                  <Icon size={18} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-medium ${trend === 'up' ? 'text-success' : 'text-danger'}`}>
                  {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {change}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {formatNumber(counts[key as keyof typeof counts])}
              </p>
              <p className="text-xs text-muted font-medium mt-0.5">{label}</p>
            </Card.Content>
          </Card.Root>
        ))}
      </div>

      {projects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card.Root variant="secondary" className="relative border border-border bg-surface/50 backdrop-blur-xl shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-separator/50 to-transparent" />
            <Card.Header className="px-5 pt-5 pb-0">
              <Card.Title className="text-sm font-semibold text-foreground">
                Proyectos por Estado
              </Card.Title>
              <Card.Description className="text-xs text-muted mt-0.5">
                Distribución de proyectos según su estado actual
              </Card.Description>
            </Card.Header>
            <Card.Content className="p-2">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="text-xs text-muted">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted text-center py-10">Sin datos</p>
              )}
            </Card.Content>
          </Card.Root>

          <Card.Root variant="secondary" className="relative border border-border bg-surface/50 backdrop-blur-xl shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-separator/50 to-transparent" />
            <Card.Header className="px-5 pt-5 pb-0">
              <Card.Title className="text-sm font-semibold text-foreground">
                Proyectos por Año
              </Card.Title>
              <Card.Description className="text-xs text-muted mt-0.5">
                Cantidad de proyectos registrados por año
              </Card.Description>
            </Card.Header>
            <Card.Content className="p-2">
              {yearData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={yearData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="year"
                      tick={{ fontSize: 12 }}
                      stroke="var(--color-muted)"
                      axisLine={{ stroke: 'var(--color-border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 12 }}
                      stroke="var(--color-muted)"
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-secondary)' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                      {yearData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={idx === yearData.length - 1 ? 'var(--color-primary)' : 'color-mix(in oklab, var(--color-primary) 60%, var(--color-surface))'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted text-center py-10">Sin datos</p>
              )}
            </Card.Content>
          </Card.Root>
        </div>
      )}

      <Card.Root variant="secondary" className="relative border border-border bg-surface/50 backdrop-blur-xl shadow-sm overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-separator/50 to-transparent" />
        <Card.Header className="px-5 pt-5 pb-2">
          <Card.Title className="text-sm font-semibold text-foreground">
            Proyectos Recientes
          </Card.Title>
          <Card.Description className="text-xs text-muted mt-0.5">
            Listado de proyectos registrados en el sistema
          </Card.Description>
        </Card.Header>
        <Card.Content className="px-0 pb-0">
          <ProjectsTable />
        </Card.Content>
      </Card.Root>
    </div>
  );
}
