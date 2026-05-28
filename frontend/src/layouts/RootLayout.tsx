import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Avatar, Drawer, Dropdown, useOverlayState } from '@heroui/react';
import { useAuthStore } from '@/shared/store/auth.store';
import { useThemeStore } from '@/shared/store/theme.store';
import { useSidebarStore } from '@/shared/store/sidebar.store';
import { PageLoader } from '@/shared/components/PageLoader';
import { SidebarNavLink } from '@/shared/components/SidebarNavLink';
import { Breadcrumbs } from '@/shared/components/Breadcrumbs';
import { ToastContainer } from '@/shared/components/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  GraduationCap,
  Building2,
  Users,
  Sun,
  Moon,
  Monitor,
  Menu,
  Check,
} from 'lucide-react';
import type { ThemeMode } from '@/shared/store/theme.store';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrador',
  TUTOR: 'Tutor',
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
  const { mode, setMode } = useThemeStore();
  const sidebar = useSidebarStore();

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
          <Drawer.Content placement="left" className="bg-surface-secondary/50">
            <Drawer.Dialog className="flex flex-col h-full">
              <Drawer.CloseTrigger />
              <Drawer.Header className="relative border-b border-border/60 px-5 py-4">
                <div className="absolute inset-x-4 -bottom-px h-px bg-gradient-to-r from-primary/40 via-accent/20 to-transparent" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm ring-1 ring-white/10 dark:ring-white/5">
                    CC
                  </div>
                  <div>
                    <Drawer.Heading className="text-base font-bold tracking-tight text-foreground">
                      Code-Craft
                    </Drawer.Heading>
                    <p className="text-[10px] text-muted/70 uppercase tracking-[0.15em]">
                      SGP
                    </p>
                  </div>
                </div>
              </Drawer.Header>
              <Drawer.Body className="flex-1 p-3 overflow-y-auto">
                <nav className="space-y-0.5">
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
                    to="/projects/new"
                    label="Nuevo Proyecto"
                    icon={PlusCircle}
                    onClick={overlayState.close}
                  />
                  {user?.role === 'ADMIN' && (
                    <>
                      <p className="text-[11px] font-semibold text-muted uppercase tracking-wider px-4 pt-6 pb-2">
                        Administración
                      </p>
                      <SidebarNavLink
                        to="/admin/careers"
                        label="Carreras"
                        icon={GraduationCap}
                        onClick={overlayState.close}
                      />
                      <SidebarNavLink
                        to="/admin/institutions"
                        label="Instituciones"
                        icon={Building2}
                        onClick={overlayState.close}
                      />
                      <SidebarNavLink
                        to="/admin/users"
                        label="Usuarios"
                        icon={Users}
                        onClick={overlayState.close}
                      />
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
        <header className="relative h-16 border-b border-border/50 flex items-center justify-between px-4 lg:px-6 gap-2 shrink-0 bg-background/80 backdrop-blur-xl">
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
          <button
            onClick={overlayState.toggle}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2">
            <Dropdown.Root>
              <Dropdown.Trigger>
                <span
                  className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors cursor-pointer inline-flex"
                  aria-label="Cambiar tema"
                >
                  <CurrentThemeIcon size={18} />
                </span>
              </Dropdown.Trigger>
              <Dropdown.Popover className="rounded-lg min-w-40" placement="bottom right">
                <Dropdown.Menu onAction={(key) => setMode(key as ThemeMode)}>
                  {themeOptions.map(({ mode: m, label, icon: Icon }) => (
                    <Dropdown.Item key={m} id={m} textValue={label}>
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span className="flex-1">{label}</span>
                        {mode === m && <Check size={14} className="text-primary" />}
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
              <Dropdown.Trigger>
                <Avatar
                  size="sm"
                  color={user?.role === 'ADMIN' ? 'warning' : 'accent'}
                  className="cursor-pointer"
                >
                  <Avatar.Fallback>{initials}</Avatar.Fallback>
                </Avatar>
              </Dropdown.Trigger>
              <Dropdown.Popover className="rounded-lg min-w-44" placement="bottom right">
                <Dropdown.Menu
                  onAction={(key) => {
                    if (key === 'profile') navigate('/profile');
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
                      Mi Perfil
                    </Dropdown.Item>
                  </Dropdown.Section>
                  <Dropdown.Section>
                    <Dropdown.Item id="logout" textValue="Cerrar Sesión">
                      <span className="text-danger">Cerrar Sesión</span>
                    </Dropdown.Item>
                  </Dropdown.Section>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown.Root>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-surface/40 scroll-smooth">
          <div className="p-6 max-w-5xl mx-auto min-h-full flex flex-col">
            <Breadcrumbs />
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
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

      <ToastContainer />
    </div>
  );
}
