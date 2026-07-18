import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Avatar,
  Drawer,
  Dropdown,
  Separator,
  Tooltip,
  useOverlayState,
} from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/store/auth.store';
import { useThemeStore } from '@/shared/store/theme.store';
import { useSidebarStore } from '@/shared/store/sidebar.store';
import { PageLoader } from '@/shared/components/PageLoader';
import { SidebarNavLink } from '@/shared/components/SidebarNavLink';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { Toaster } from 'sileo';
import { isAdmin, isStudent } from '@/shared/utils/role';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  GraduationCap,
  Building2,
  Users,
  Sun,
  Moon,
  Monitor,
  Menu,
  Check,
  SquareArrowRightExit,
  CircleUser,
  Info,
  FolderKanban,
  History,
  Search,
  Repeat,
  CalendarRange,
  GitBranch,
  BookOpen,
  MapPin,
  UserRound,
  Tag,
  Gavel,
} from 'lucide-react';
import type { ThemeMode } from '@/shared/store/theme.store';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  IRCOP: 'Administrador suplente',
  DOCENTE: 'Docente',
  STUDENT: 'Estudiante',
};

const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: 'Claro', icon: Sun },
  { mode: 'dark', label: 'Oscuro', icon: Moon },
  { mode: 'system', label: 'Sistema', icon: Monitor },
];

/**
 * Sidebar section rendered as a subtle glass card grouping related nav links.
 */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-border bg-surface-secondary p-2 shadow-1 dark:bg-[#00000036]">
      <p className="px-2 pb-1.5 pt-1 text-[10px] font-semibold text-primary/70 uppercase tracking-[0.14em]">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function RootLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, setMode, resolved } = useThemeStore();
  const sidebar = useSidebarStore();

  const { data: pnfCount } = useQuery({
    queryKey: ['pnf'],
    queryFn: ({ signal }) => catalogService.getPnfs(undefined, signal),
    staleTime: 5 * 60 * 1000,
    enabled: isAdmin(user?.role),
  });

  const { data: institutionCount } = useQuery({
    queryKey: ['institutions'],
    queryFn: ({ signal }) => catalogService.getInstitutions(signal),
    staleTime: 5 * 60 * 1000,
    enabled: isAdmin(user?.role),
  });

  const { data: userCount } = useQuery({
    queryKey: ['users'],
    queryFn: ({ signal }) => catalogService.getUsers(undefined, signal),
    staleTime: 5 * 60 * 1000,
    enabled: isAdmin(user?.role),
  });

  const { data: periodCount } = useQuery({
    queryKey: ['periods'],
    queryFn: ({ signal }) => catalogService.getPeriodsPaginated(1, 1, undefined, signal),
    staleTime: 5 * 60 * 1000,
    enabled: isAdmin(user?.role),
    select: (data) => data.meta.total,
  });

  const { data: trajectoryCount } = useQuery({
    queryKey: ['trajectories'],
    queryFn: ({ signal }) => catalogService.getTrajectoriesPaginated(1, 1, undefined, signal),
    staleTime: 5 * 60 * 1000,
    enabled: isAdmin(user?.role),
    select: (data) => data.meta.total,
  });

  const { data: subjectCount } = useQuery({
    queryKey: ['subjects'],
    queryFn: ({ signal }) => catalogService.getSubjectsPaginated(1, 1, undefined, signal),
    staleTime: 5 * 60 * 1000,
    enabled: isAdmin(user?.role),
    select: (data) => data.meta.total,
  });

  const { data: communityPlaceCount } = useQuery({
    queryKey: ['community-places'],
    queryFn: ({ signal }) => catalogService.getCommunityPlacesPaginated(1, 1, undefined, signal),
    staleTime: 5 * 60 * 1000,
    enabled: isAdmin(user?.role),
    select: (data) => data.meta.total,
  });

  const { data: communityTutorCount } = useQuery({
    queryKey: ['community-tutors'],
    queryFn: ({ signal }) => catalogService.getCommunityTutorsPaginated(1, 1, undefined, signal),
    staleTime: 5 * 60 * 1000,
    enabled: isAdmin(user?.role),
    select: (data) => data.meta.total,
  });

  const { data: tagCount } = useQuery({
    queryKey: ['tags'],
    queryFn: ({ signal }) => catalogService.getTagsPaginated(1, 1, undefined, signal),
    staleTime: 5 * 60 * 1000,
    enabled: isAdmin(user?.role),
    select: (data) => data.meta.total,
  });

  const overlayState = useOverlayState({
    onOpenChange(isOpen) {
      if (isOpen) sidebar.open();
      else sidebar.close();
    },
  });

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '?';

  const CurrentThemeIcon =
    themeOptions.find((t) => t.mode === mode)?.icon ?? Monitor;

  return (
    <div className="h-dvh bg-background text-foreground flex">
      <PageLoader />

      <Drawer state={overlayState}>
        <Drawer.Trigger className="sr-only" aria-hidden tabIndex={-1} />
        <Drawer.Backdrop
          variant="blur"
          style={{ background: 'none', backdropFilter: 'blur(3px)' }}
        >
          <Drawer.Content placement="left" className="bg-surface-secondary/60 backdrop-blur-2xl border-r border-border/60">
            <Drawer.Dialog className="relative flex flex-col h-full">
              <Drawer.CloseTrigger className="z-20" />
              <Drawer.Header className="relative border-b border-border/60 px-5 py-4">
                <div className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25 ring-1 ring-white/10 dark:ring-white/5 overflow-hidden">
                    <img src="/logouptt.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <Drawer.Heading className="font-display text-lg font-extrabold tracking-tight text-foreground">
                      SGP
                    </Drawer.Heading>
                    <p className="text-[10px] text-muted/70 uppercase tracking-[0.18em]">
                      Gestión de Proyectos
                    </p>
                  </div>
                </div>
              </Drawer.Header>
              <Drawer.Body className="relative flex-1 p-3 overflow-y-auto">
                <nav className="space-y-4">
                  {isStudent(user?.role) ? (
                    <Section label="Navegación">
                      <SidebarNavLink
                        to="/"
                        end
                        label="Dashboard"
                        icon={LayoutDashboard}
                        onClick={overlayState.close}
                      />
                      <SidebarNavLink
                        to={`/projects?authorId=${user?.id}`}
                        label="Mi Proyecto"
                        icon={FolderKanban}
                        onClick={overlayState.close}
                      />
                      <SidebarNavLink
                        to="/antecedentes"
                        label="Antecedentes"
                        icon={Search}
                        onClick={overlayState.close}
                      />
                    </Section>
                  ) : (
                    <>
                      <Section label="Navegación">
                        <SidebarNavLink
                          to="/"
                          end
                          label="Dashboard"
                          icon={LayoutDashboard}
                          onClick={overlayState.close}
                        />
                        <SidebarNavLink
                          to="/projects"
                          label="Proyectos"
                          icon={FolderKanban}
                          onClick={overlayState.close}
                        />
                        <SidebarNavLink
                          to="/antecedentes"
                          label="Antecedentes"
                          icon={Search}
                          onClick={overlayState.close}
                        />
                      </Section>
                      {isAdmin(user?.role) && (
                        <>
                          <Section label="Administración">
                            <SidebarNavLink
                              to="/admin/pnf"
                              label="PNFs"
                              icon={GraduationCap}
                              badge={pnfCount?.length}
                              onClick={overlayState.close}
                            />
                            <SidebarNavLink
                              to="/admin/institutions"
                              label="Instituciones"
                              icon={Building2}
                              badge={institutionCount?.length}
                              onClick={overlayState.close}
                            />
                            <SidebarNavLink
                              to="/admin/users"
                              label="Usuarios"
                              icon={Users}
                              badge={userCount?.length}
                              onClick={overlayState.close}
                            />
                            <SidebarNavLink
                              to="/admin/activity-log"
                              label="Actividad"
                              icon={History}
                              onClick={overlayState.close}
                            />
                            <SidebarNavLink
                              to="/admin/loop"
                              label="Loop Engineering"
                              icon={Repeat}
                              onClick={overlayState.close}
                            />
                            <SidebarNavLink
                              to="/defensas"
                              label="Defensas"
                              icon={Gavel}
                              onClick={overlayState.close}
                            />
                          </Section>
                          <Section label="Catálogos">
                            <SidebarNavLink
                              to="/admin/periods"
                              label="Periodos"
                              icon={CalendarRange}
                              badge={periodCount}
                              onClick={overlayState.close}
                            />
                            <SidebarNavLink
                              to="/admin/trajectories"
                              label="Trayectos"
                              icon={GitBranch}
                              badge={trajectoryCount}
                              onClick={overlayState.close}
                            />
                            <SidebarNavLink
                              to="/admin/subjects"
                              label="Materias"
                              icon={BookOpen}
                              badge={subjectCount}
                              onClick={overlayState.close}
                            />
                            <SidebarNavLink
                              to="/admin/community-places"
                              label="Espacios Comunitarios"
                              icon={MapPin}
                              badge={communityPlaceCount}
                              onClick={overlayState.close}
                            />
                            <SidebarNavLink
                              to="/admin/community-tutors"
                              label="Tutores Comunitarios"
                              icon={UserRound}
                              badge={communityTutorCount}
                              onClick={overlayState.close}
                            />
                            <SidebarNavLink
                              to="/admin/tags"
                              label="Etiquetas"
                              icon={Tag}
                              badge={tagCount}
                              onClick={overlayState.close}
                            />
                          </Section>
                        </>
                      )}
                    </>
                  )}
                </nav>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      <div className="flex-1 flex flex-col min-h-0">
        <header className="relative h-16 border-b border-border/60 flex items-center justify-between px-4 lg:px-6 gap-2 shrink-0 bg-background/80 backdrop-blur-2xl shadow-1">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="flex items-center gap-2 min-w-0">
            <Tooltip>
              <Tooltip.Trigger>
                <button
                  onClick={overlayState.toggle}
                  className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Abrir menú"
                >
                  <Menu size={20} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content>Menú</Tooltip.Content>
            </Tooltip>

            <Link to="/" className="flex items-center gap-2.5 min-w-0 group">
              <span
                className="size-9 shrink-0 rounded-xl flex items-center justify-center overflow-hidden p-1.5 shadow-1 ring-1 ring-white/10"
                style={{ backgroundImage: 'var(--gradient-brand)' }}
              >
                <img src="/logouptt.png" alt="Logo" className="w-full object-contain" />
              </span>
              <span className="hidden sm:flex flex-col leading-tight min-w-0">
                <span className="font-display text-sm font-bold tracking-tight text-foreground">
                  SGP
                </span>
                <span className="text-[11px] text-muted truncate">
                  Sistema de Gestión de Proyectos
                </span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Dropdown.Root>
              <Tooltip>
                <Tooltip.Trigger>
                  <Dropdown.Trigger>
                    <span
                      className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-colors inline-flex"
                      aria-label="Cambiar tema"
                    >
                      <CurrentThemeIcon size={18} />
                    </span>
                  </Dropdown.Trigger>
                </Tooltip.Trigger>
                <Tooltip.Content>Cambiar tema</Tooltip.Content>
              </Tooltip>
              <Dropdown.Popover
                className="rounded-lg min-w-40"
                placement="bottom right"
              >
                <Dropdown.Menu onAction={(key) => setMode(key as ThemeMode)}>
                  {themeOptions.map(({ mode: m, label, icon: Icon }) => (
                    <Dropdown.Item key={m} id={m} textValue={label}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span className="flex-1">{label}</span>
                        {mode === m && (
                          <Check size={14} className="text-primary" />
                        )}
                      </div>
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.Root>
            <Dropdown.Root>
              <Tooltip>
                <Tooltip.Trigger>
                  <Dropdown.Trigger>
                    <span className="flex items-center gap-2.5 rounded-full border border-border/70 bg-surface-secondary/60 py-1 pl-1 pr-3 transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-primary/50 cursor-pointer">
                      <Avatar
                        size="sm"
                        color={isAdmin(user?.role) ? 'warning' : 'accent'}
                      >
                        <Avatar.Fallback>{initials}</Avatar.Fallback>
                      </Avatar>
                      <span className="hidden text-sm font-medium text-foreground sm:inline">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </span>
                  </Dropdown.Trigger>
                </Tooltip.Trigger>
                <Tooltip.Content>Menú de usuario</Tooltip.Content>
              </Tooltip>
              <Dropdown.Popover
                className="rounded-lg min-w-44"
                placement="bottom right"
              >
                <Dropdown.Menu
                  className={'min-w-56'}
                  onAction={(key) => {
                    if (key === 'profile') navigate('/profile');
                    if (key === 'help') navigate('/help');
                    if (key === 'logout') logout();
                  }}
                >
                  <Dropdown.Section>
                    <Dropdown.Item id="user-info" textValue="Perfil" isDisabled>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user?.firstName} {user?.lastName}
                        </span>
                        <span className="text-xs text-muted">
                          {roleLabels[user?.role ?? ''] ?? user?.role}
                        </span>
                      </div>
                    </Dropdown.Item>
                  </Dropdown.Section>
                  <Dropdown.Section>
                    <Dropdown.Item id="profile" textValue="Mi Perfil">
                      <CircleUser size={20} />
                      Mi Perfil
                    </Dropdown.Item>
                    <Dropdown.Item id="help" textValue="Ayuda">
                      <Info size={20} />
                      Ayuda
                    </Dropdown.Item>
                  </Dropdown.Section>
                  <Separator className="my-1" />
                  <Dropdown.Section>
                    <Dropdown.Item id="logout" textValue="Cerrar Sesión">
                      <span className="text-danger flex flex-row items-center gap-2">
                        <SquareArrowRightExit size={20} />
                        Cerrar Sesión
                      </span>
                    </Dropdown.Item>
                  </Dropdown.Section>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.Root>
          </div>
        </header>

        <main className="relative flex-1 overflow-auto bg-gradient-to-br from-primary/[0.05] via-background to-accent/[0.05] scroll-smooth">
          {/* Login-style brand atmosphere for the content views (same shapes) */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-primary)_0%,_transparent_60%)] opacity-[0.04]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-accent)_0%,_transparent_60%)] opacity-[0.04]" />
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/[0.04] animate-float-1" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/[0.04] animate-float-2" />
            <div className="absolute top-1/4 -right-16 w-48 h-48 rounded-full bg-warning/[0.02] animate-float-3" />
            <div className="absolute bottom-1/4 -left-20 w-56 h-56 border border-primary/[0.04] rounded-3xl -rotate-12 animate-float-4" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_var(--color-border)_1px,_transparent_0)] [background-size:32px_32px] opacity-[0.2]" />
          </div>
          <div className="p-6 max-w-5xl mx-auto min-h-full flex flex-col relative z-0">
            <Breadcrumbs />
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={
                    typeof window !== 'undefined' &&
                    window.matchMedia('(prefers-reduced-motion: reduce)').matches
                      ? { duration: 0 }
                      : { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }
                  }
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
            <footer className="pt-8 pb-2 text-center text-[10px] text-muted">
              &copy; {new Date().getFullYear()} OdalX-Enterprise SGP &mdash;
              Sistema de Gestión de Proyectos
            </footer>
          </div>
        </main>
      </div>

      <Toaster
        position="top-center"
        options={{
          fill: resolved === 'dark' ? '#f2f2f2' : '#1a1a1a',
          styles: {
            title: resolved === 'dark' ? 'text-black!' : 'text-white!',
            description: resolved === 'dark' ? 'text-black/75!' : 'text-white/75!',
            badge: resolved === 'dark' ? 'bg-black/10!' : 'bg-white/10!',
          },
        }}
      />
    </div>
  );
}
