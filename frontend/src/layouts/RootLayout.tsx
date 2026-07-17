import { Outlet, useNavigate, useLocation } from 'react-router-dom';
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

      <Drawer>
        <Drawer.Backdrop
          variant="blur"
          isOpen={overlayState.isOpen}
          onOpenChange={overlayState.setOpen}
        >
          <Drawer.Content placement="left" className="bg-surface-secondary">
            <Drawer.Dialog className="flex flex-col h-full">
              <Drawer.CloseTrigger />
              <Drawer.Header className="relative border-b border-border/60 px-5 py-4">
                <div className="absolute inset-x-4 -bottom-px h-px bg-linear-to-r from-primary/60 via-primary/30 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm ring-1 ring-white/10 dark:ring-white/5 overflow-hidden">
                    <img src="/logouptt.png" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <Drawer.Heading className="text-base font-bold tracking-tight text-foreground">
                      SGP
                    </Drawer.Heading>
                    <p className="text-[10px] text-muted/70 uppercase tracking-[0.15em]">
                      SGP
                    </p>
                  </div>
                </div>
              </Drawer.Header>
              <Drawer.Body className="flex-1 p-3 overflow-y-auto">
                <nav className="space-y-0.5">
                  {isStudent(user?.role) ? (
                    <>
                      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-4 pt-5 pb-2">
                        Navegación
                      </p>
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
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-4 pt-5 pb-2">
                        Navegación
                      </p>
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
                      {isAdmin(user?.role) && (
                        <>
                          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-4 pt-6 pb-2">
                            Administración
                          </p>
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
                          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-4 pt-6 pb-2">
                            Catálogos
                          </p>
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
                        </>
                      )}
                    </>
                  )}
                </nav>
              </Drawer.Body>
              <Drawer.Footer className="border-t border-border/60 px-5 py-4 justify-center">
                <p className="text-xs text-muted/70 text-center">
                  &copy; {new Date().getFullYear()} Code-Craft
                </p>
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      <div className="flex-1 flex flex-col min-h-0">
        <header className="relative h-16 border-b border-border/60 flex items-center justify-between px-4 lg:px-6 gap-2 shrink-0 bg-background/90 backdrop-blur-xl shadow-sm shadow-primary/[0.02]">
          <div
            className="absolute inset-x-0 bottom-0 h-px bg-linear
          -to-r from-transparent via-primary/30 to-transparent"
          />
          <Tooltip>
            <Tooltip.Trigger>
              <button
                onClick={overlayState.toggle}
                className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
                aria-label="Abrir menú"
              >
                <Menu size={20} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Content>Menú</Tooltip.Content>
          </Tooltip>

          <div className="flex items-center gap-2">
            <Dropdown.Root>
              <Tooltip>
                <Tooltip.Trigger>
                  <Dropdown.Trigger>
                    <span
                      className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors inline-flex"
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
            <div className="w-px h-6 bg-separator mx-1" />
            <span className="text-sm text-muted hidden sm:inline">
              {user?.firstName} {user?.lastName}
            </span>
            <Dropdown.Root>
              <Tooltip>
                <Tooltip.Trigger>
                  <Dropdown.Trigger>
                    <span className="rounded-full inline-flex focus-visible:outline-2 focus-visible:outline-primary/50">
                      <Avatar
                        size="sm"
                        color={isAdmin(user?.role) ? 'warning' : 'accent'}
                      >
                        <Avatar.Fallback>{initials}</Avatar.Fallback>
                      </Avatar>
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
                    if (key === 'activity-log') navigate('/admin/activity-log');
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
                    {isAdmin(user?.role) && (
                      <Dropdown.Item id="activity-log" textValue="Actividad">
                        <History size={20} />
                        Actividad
                      </Dropdown.Item>
                    )}
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

        <main className="relative flex-1 overflow-auto bg-background scroll-smooth">
          {/* Decorative background blobs */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0" aria-hidden="true">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/[0.03] dark:bg-primary/[0.04] blur-3xl animate-blob" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/[0.02] dark:bg-accent/[0.03] blur-3xl animate-blob2" />
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
                  transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
            <footer className="pt-8 pb-2 text-center text-[10px] text-muted">
              &copy; {new Date().getFullYear()} Code-Craft SGP &mdash; Sistema
              de Gestión de Proyectos
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
