import { Button, Alert, Chip } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/store/auth.store';
import { projectService } from '../services/project.service';
import { ProjectsTable } from '../components/ProjectsTable';
import { Card, StatCard } from '@/shared/components/ui';
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
import {
  CheckCircle2,
  Clock,
  XCircle,
  FolderKanban,
  ShieldQuestion,
  X,
  Calendar,
  Activity,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useHasSecurityQuestions } from '@/features/security-questions/hooks/useSecurityQuestions';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { statusConfig } from '@/shared/constants/statusConfig';

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

function formatNumber(n: number | string): string {
  const num = typeof n === 'string' ? Number(n) : n;
  if (!Number.isFinite(num)) return String(n);
  return num >= 1000 ? `${(num / 1000).toFixed(1)}k` : String(num);
}

const statusColors: Record<string, string> = {
  COMPLETED: 'var(--color-success)',
  PENDING_VALIDATION: 'var(--color-warning)',
  REJECTED: 'var(--color-danger)',
};

const statusLabels: Record<string, string> = {
  total: 'Total Proyectos',
  COMPLETED: 'Completados',
  PENDING_VALIDATION: 'Pendientes',
  REJECTED: 'Rechazados',
};

const statCards = [
  {
    key: 'total' as const,
    label: 'Total Proyectos',
    icon: FolderKanban,
    accent: 'primary' as const,
  },
  {
    key: 'COMPLETED' as const,
    label: 'Completados',
    icon: CheckCircle2,
    accent: 'success' as const,
  },
  {
    key: 'PENDING_VALIDATION' as const,
    label: 'Pendientes',
    icon: Clock,
    accent: 'warning' as const,
  },
  {
    key: 'REJECTED' as const,
    label: 'Rechazados',
    icon: XCircle,
    accent: 'danger' as const,
  },
  {
    key: 'thisYear' as const,
    label: 'Este Año',
    icon: Calendar,
    accent: 'accent' as const,
  },
];

const BANNER_DISMISSED_KEY = 'security-banner-dismissed';

function formatDate(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

export default function DashboardPage() {
  usePageTitle('Dashboard');
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['projects', 'stats'],
    queryFn: ({ signal }) => projectService.getStats(signal),
    staleTime: 30 * 1000,
  });
  const { data: hasQuestions, isLoading: questionsLoading } = useHasSecurityQuestions();
  const [bannerDismissed, setBannerDismissed] = useState(
    () => localStorage.getItem(BANNER_DISMISSED_KEY) === 'true',
  );

  const dismissBanner = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, 'true');
    setBannerDismissed(true);
  };

  const showBanner = hasQuestions === false && !bannerDismissed && !questionsLoading;

  const counts: Record<string, number> = {
    total: stats?.total ?? 0,
    COMPLETED: stats?.completed ?? 0,
    PENDING_VALIDATION: stats?.pendingValidation ?? 0,
    REJECTED: stats?.rejected ?? 0,
    thisYear: stats?.thisYear ?? 0,
  };

  const pieData = (['COMPLETED', 'PENDING_VALIDATION', 'REJECTED'] as const)
    .filter((s) => counts[s] > 0)
    .map((s) => ({ name: statusLabels[s], value: counts[s], color: statusColors[s] }));

  const yearData = stats?.byYear ?? [];
  const topTutors = stats?.topTutors ?? [];
  const recentActivity = stats?.recentActivity ?? [];

  const tutorChartData = topTutors.map((t) => ({
    name: `${t.firstName} ${t.lastName}`,
    proyectos: t.projectCount,
  }));

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Buenos días' : currentHour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-accent" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground pl-3">
            <span className="text-muted font-medium">{greeting}, </span>
            {user?.firstName ?? 'Usuario'}
          </h1>
          <p className="text-sm text-muted mt-0.5 pl-3">Resumen general del sistema</p>
        </div>
      </div>

      {showBanner && (
        <Alert.Root color="warning" className="border border-warning/20">
          <Alert.Indicator>
            <ShieldQuestion size={18} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Configure sus preguntas de seguridad</Alert.Title>
            <Alert.Description className="mt-0">
              Esto le permitirá recuperar su cuenta en caso de olvidar su contraseña.
            </Alert.Description>
            <Link
              to="/profile"
              className="text-xs text-primary hover:underline font-medium mt-1.5 inline-block"
            >
              Ir a configuración
            </Link>
          </Alert.Content>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            className="shrink-0 self-start"
            onPress={dismissBanner}
            aria-label="Descartar"
          >
            <X size={14} />
          </Button>
        </Alert.Root>
      )}

      {statsLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {statCards.map(({ key, label, icon }) => (
            <StatCard key={key} label={label} value={0} icon={icon} loading />
          ))}
        </div>
      ) : statsError ? (
        <Card variant="plain" className="border border-danger/20 bg-danger/5">
          <Card.Content className="p-4 text-center">
            <p className="text-sm text-danger">Error al cargar estadísticas</p>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {statCards.map(({ key, label, icon, accent }) => (
            <StatCard
              key={key}
              label={label}
              value={counts[key]}
              icon={icon}
              accent={accent}
              formatValue={formatNumber}
            />
          ))}
        </div>
      )}

      {stats && stats.total > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="transition-all duration-200 hover:shadow-md">
            <Card.Header>
              <Card.Title>Proyectos por Estado</Card.Title>
              <Card.Description>
                Distribución de proyectos según su estado actual
              </Card.Description>
            </Card.Header>
            <Card.Content className="p-2">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <title>Distribución de proyectos por estado</title>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      isAnimationActive
                      animationBegin={150}
                      animationDuration={600}
                      animationEasing="ease-out"
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
          </Card>

          <Card className="transition-all duration-200 hover:shadow-md">
            <Card.Header>
              <Card.Title>Proyectos por Año</Card.Title>
              <Card.Description>
                Cantidad de proyectos registrados por año
              </Card.Description>
            </Card.Header>
            <Card.Content className="p-2">
              {yearData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={yearData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                    <title>Cantidad de proyectos registrados por año</title>
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
                    <Bar
                      dataKey="count"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={50}
                      isAnimationActive
                      animationBegin={200}
                      animationDuration={500}
                      animationEasing="ease-out"
                    >
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
          </Card>
        </div>
      )}

      {stats && topTutors.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <Users size={16} className="text-primary" />
              Top Tutores por Proyectos
            </Card.Title>
            <Card.Description>
              Tutores con mayor cantidad de proyectos asignados
            </Card.Description>
          </Card.Header>
          <Card.Content className="p-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={tutorChartData} layout="vertical" margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <title>Tutores con mayor cantidad de proyectos asignados</title>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--color-muted)" tickLine={false} />
                <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} stroke="var(--color-muted)" tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-surface-secondary)' }} />
                <Bar
                  dataKey="proyectos"
                  fill="var(--color-primary)"
                  radius={[0, 6, 6, 0]}
                  maxBarSize={30}
                  isAnimationActive
                  animationBegin={250}
                  animationDuration={500}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <Card.Header>
            <Card.Title className="flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              Actividad Reciente
            </Card.Title>
            <Card.Description>
              Últimos cambios en proyectos
            </Card.Description>
          </Card.Header>
          <Card.Content className="p-3">
            {recentActivity.length > 0 ? (
              <div className="space-y-1">
                {recentActivity.map((item) => {
                  const cfg = statusConfig[item.status as keyof typeof statusConfig] ?? { color: 'default', label: item.status };
                  return (
                    <div key={item.id} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-secondary/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground truncate">{item.title}</p>
                        <p className="text-[10px] text-muted mt-0.5">{formatDate(item.updatedAt)}</p>
                      </div>
                      <Chip color={cfg.color as 'default' | 'success' | 'warning' | 'danger'} variant="soft" size="sm">{cfg.label}</Chip>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-6">Sin actividad reciente</p>
            )}
          </Card.Content>
        </Card>

        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Proyectos Recientes</Card.Title>
            <Card.Description>
              Listado de proyectos registrados en el sistema
            </Card.Description>
          </Card.Header>
          <Card.Content className="px-0 pb-0">
            <ProjectsTable />
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}