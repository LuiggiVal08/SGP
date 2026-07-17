import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useAuthStore } from '@/shared/store/auth.store';
import { isAdmin } from '@/shared/utils/role';
import { Card, Button } from '@heroui/react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  GraduationCap,
  Building2,
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  CircleUser,
  ArrowRight,
  HelpCircle,
  Mail,
  LogIn,
  FileEdit,
  FolderOpen,
  Upload,
  UserCheck,
  KeyRound,
  BookOpen,
  ExternalLink,
  Lock,
  AlertTriangle,
  List,
  Compass,
  Briefcase,
} from 'lucide-react';

interface HelpItem {
  icon: typeof LayoutDashboard;
  text: string;
}

interface HelpSection {
  id: string;
  title: string;
  icon: typeof LayoutDashboard;
  items: HelpItem[];
}

const commonSections: HelpSection[] = [
  {
    id: 'primeros-pasos',
    title: 'Primeros Pasos',
    icon: Compass,
    items: [
      { icon: LogIn, text: 'Inicia sesión con tu correo electrónico y contraseña proporcionados por el administrador.' },
      { icon: UserCheck, text: 'Una vez dentro, accede al Dashboard para ver el resumen de proyectos.' },
      { icon: CircleUser, text: 'Dirígete a tu Perfil para actualizar tus datos personales y configurar preguntas de seguridad.' },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    items: [
      { icon: LayoutDashboard, text: 'Vista general con estadísticas de proyectos: total, por estado (completados, pendientes, rechazados) y por año.' },
      { icon: Search, text: 'Busca proyectos por nombre, filtra por tutor, PNF o año desde la tabla de proyectos.' },
      { icon: FolderOpen, text: 'Haz clic en cualquier proyecto para ver su detalle completo, incluyendo autores, tutor y archivos.' },
    ],
  },
  {
    id: 'proyectos',
    title: 'Proyectos',
    icon: Briefcase,
    items: [
      { icon: PlusCircle, text: 'Crea un nuevo proyecto completando título, año, PNF, autores (máximo 3, hasta 5 con permiso excepcional) y tutor.' },
      { icon: Upload, text: 'Sube archivos al proyecto: PDF, código fuente o plan de negocio. Puedes subir múltiples archivos.' },
      { icon: FileEdit, text: 'Edita los datos del proyecto, actualiza el tutor comunitario o cambia el estado (completado, pendiente, rechazado).' },
      { icon: Search, text: 'Explora todos los proyectos desde el listado completo con paginación y filtros.' },
    ],
  },
  {
    id: 'perfil',
    title: 'Perfil',
    icon: CircleUser,
    items: [
      { icon: CircleUser, text: 'Edita tu información personal: nombre, apellido, correo electrónico, DNI y teléfono.' },
      { icon: ShieldCheck, text: 'Configura hasta 3 preguntas de seguridad con sus respuestas para poder recuperar tu contraseña.' },
      { icon: KeyRound, text: 'Cambia tu contraseña desde la opción "Cambiar contraseña" en tu perfil.' },
    ],
  },
  {
    id: 'recuperacion',
    title: 'Recuperación de Contraseña',
    icon: KeyRound,
    items: [
      { icon: KeyRound, text: 'En la pantalla de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?" e ingresa tu correo.' },
      { icon: ShieldCheck, text: 'Responde correctamente tus preguntas de seguridad para verificar tu identidad.' },
      { icon: Lock, text: 'Establece una nueva contraseña. Si no configuraste preguntas de seguridad, contacta al administrador.' },
    ],
  },
];

const adminSections: HelpSection[] = [
  {
    id: 'pnfs',
    title: 'PNFs (Programas Nacionales de Formación)',
    icon: GraduationCap,
    items: [
      { icon: GraduationCap, text: 'Crea, edita y elimina PNFs. Son los programas formativos asociados a los proyectos.' },
      { icon: AlertTriangle, text: 'No se puede eliminar una PNF si tiene usuarios o proyectos asociados.' },
    ],
  },
  {
    id: 'instituciones',
    title: 'Instituciones',
    icon: Building2,
    items: [
      { icon: Building2, text: 'Gestiona las instituciones participantes: nombre, siglas, correo e información de contacto.' },
      { icon: AlertTriangle, text: 'Las instituciones no pueden eliminarse si tienen usuarios vinculados.' },
    ],
  },
  {
    id: 'usuarios',
    title: 'Usuarios',
    icon: Users,
    items: [
      { icon: UserPlus, text: 'Registra nuevos usuarios con sus datos personales, rol (STUDENT, DOCENTE, ADMIN), PNF e institución.' },
      { icon: Users, text: 'Activa o desactiva usuarios. Un usuario desactivado no puede iniciar sesión.' },
      { icon: FileEdit, text: 'Edita los datos de cualquier usuario desde el panel de administración.' },
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

export default function HelpPage() {
  usePageTitle('Ayuda');
  const user = useAuthStore((s) => s.user);

  return (
    <motion.div
      className="max-w-6xl mx-auto relative scroll-smooth"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative background blobs */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden -z-0"
        aria-hidden="true"
      >
        <div className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-primary/[0.04] dark:bg-primary/[0.06] blur-3xl animate-blob" />
        <div className="absolute top-60 -left-40 w-80 h-80 rounded-full bg-accent/[0.03] dark:bg-accent/[0.04] blur-3xl animate-blob2" />
      </div>

      {/* 1. Hero Header */}
      <motion.header
        variants={cardVariants}
        className="relative overflow-hidden"
      >
        <div className="relative">
          <h1 className="text-4xl font-bold text-foreground">Ayuda</h1>
          <div className="h-1 w-24 mt-2 bg-gradient-to-r from-primary via-accent to-primary/10 rounded-full" />
          <p className="text-muted mt-3 max-w-lg">
            Bienvenido a Code-Craft SGP — Sistema de Gestión de Proyectos.
          </p>
        </div>
      </motion.header>

      <div className="flex gap-8 items-start mt-8">
        {/* 2. Sidebar — Table of Contents */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-4">
          <div className="rounded-xl border border-border/60 bg-surface-secondary/30 backdrop-blur-sm overflow-hidden">
            <div className="p-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
                  <List size={13} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                  Contenido
                </span>
              </div>
            </div>
            <div className="p-3">
                <nav className="flex flex-col gap-1">
                  {[...commonSections, ...adminSections].map((s) => {
                    const SectionIcon = s.icon;
                    return (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary hover:bg-primary/[0.04] rounded-lg px-2 py-1.5 transition-all duration-200"
                      >
                        <SectionIcon size={14} className="shrink-0" />
                        <span>{s.title}</span>
                      </a>
                    );
                  })}
                  <a
                    href="#api-docs"
                    className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary hover:bg-primary/[0.04] rounded-lg px-2 py-1.5 transition-all duration-200"
                  >
                    <BookOpen size={14} className="shrink-0" />
                    <span>Documentación de la API</span>
                  </a>
                  <a
                    href="#contacto"
                    className="flex items-center gap-2 text-sm text-foreground/70 hover:text-primary hover:bg-primary/[0.04] rounded-lg px-2 py-1.5 transition-all duration-200"
                  >
                    <Mail size={14} className="shrink-0" />
                    <span>Contacto</span>
                  </a>
                </nav>
              </div>
            </div>
        </aside>

        {/* 3. Main Content */}
        <main className="flex-1 min-w-0 space-y-8">
          {/* Common Sections */}
          {commonSections.map((section) => (
            <motion.div key={section.title} variants={cardVariants}>
              <Card.Root
                variant="secondary"
                className="group relative border border-border/60 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-accent to-primary/10" />

                <Card.Content className="p-6 relative">
                  <h2 id={section.id} className="text-lg font-bold text-foreground mb-4 scroll-mt-24">
                    {section.title}
                  </h2>

                  <div className="space-y-2">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={item.text}
                          variants={itemVariants}
                          className="group/item flex items-start gap-3 rounded-xl border border-transparent hover:border-primary/10 hover:bg-primary/[0.02] p-3 -mx-1 transition-all duration-200 cursor-default"
                        >
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center shrink-0 ring-1 ring-primary/10 group-hover/item:ring-primary/20 group-hover/item:scale-110 transition-all duration-200">
                            <Icon size={16} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0 pt-1">
                            <p className="text-sm text-foreground/80 leading-relaxed">
                              {item.text}
                            </p>
                          </div>
                          <ArrowRight
                            size={14}
                            className="text-primary/30 mt-1.5 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 shrink-0"
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                </Card.Content>
              </Card.Root>
            </motion.div>
          ))}

          {/* 4. Admin Sections */}
          {isAdmin(user?.role) && (
            <motion.div variants={cardVariants}>
              <Card.Root
                variant="secondary"
                className="group relative border border-warning/20 overflow-hidden hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-warning via-warning/60 to-warning/10" />

                <span className="absolute top-0 right-0 text-[10px] font-bold text-warning bg-warning/10 px-2.5 py-1 rounded-bl-xl uppercase tracking-[0.15em] border-b border-l border-warning/15">
                  Admin
                </span>

                <Card.Content className="p-6 relative">
                  <h2 className="text-lg font-bold text-foreground mb-4">
                    Administración
                  </h2>

                  <div className="space-y-6">
                    {adminSections.map((section) => (
                      <div key={section.id}>
                        <h3 id={section.id} className="text-sm font-semibold text-muted uppercase tracking-wider mb-3 scroll-mt-24">
                          {section.title}
                        </h3>
                        <div className="space-y-2">
                          {section.items.map((item) => {
                            const Icon = item.icon;
                            return (
                              <motion.div
                                key={item.text}
                                variants={itemVariants}
                                className="group/item flex items-start gap-3 rounded-xl border border-transparent hover:border-warning/10 hover:bg-warning/[0.02] p-3 -mx-1 transition-all duration-200 cursor-default"
                              >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-warning/15 to-warning/5 flex items-center justify-center shrink-0 ring-1 ring-warning/10 group-hover/item:ring-warning/20 group-hover/item:scale-110 transition-all duration-200">
                                  <Icon size={16} className="text-warning" />
                                </div>
                                <div className="flex-1 min-w-0 pt-1">
                                  <p className="text-sm text-foreground/80 leading-relaxed">
                                    {item.text}
                                  </p>
                                </div>
                                <ArrowRight
                                  size={14}
                                  className="text-warning/30 mt-1.5 opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-200 shrink-0"
                                />
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card.Root>
            </motion.div>
          )}

          {/* 5. API Docs Section */}
          <motion.div variants={cardVariants}>
            <Card.Root
              variant="secondary"
              className="relative border border-border/60 overflow-hidden group hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-primary to-accent/10" />

              <Card.Content className="p-6 text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/15 to-primary/10 flex items-center justify-center mx-auto mb-4 ring-1 ring-accent/10">
                  <BookOpen size={24} className="text-accent" />
                </div>
                <h2 id="api-docs" className="text-xl font-bold text-foreground mb-2 scroll-mt-24">
                  Documentación de la API
                </h2>
                <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                  Consulta la documentación interactiva de la API REST con Swagger.
                  Allí encontrarás todos los endpoints disponibles, sus parámetros y
                  ejemplos de uso.
                </p>
                <div className="mt-6">
                  <Button
                    variant="primary"
                    size="lg"
                    className="font-medium gap-2"
                    onPress={() => window.open('/api/docs', '_blank')}
                  >
                    <ExternalLink size={16} />
                    Ir a la documentación
                  </Button>
                </div>
              </Card.Content>
            </Card.Root>
          </motion.div>

          {/* 6. Contact Section */}
          <motion.div variants={cardVariants}>
            <Card.Root
              variant="secondary"
              className="relative border border-border/60 overflow-hidden"
            >
              <div
                className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary/20 rounded-tl"
                aria-hidden="true"
              />
              <div
                className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary/20 rounded-tr"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary/20 rounded-bl"
                aria-hidden="true"
              />
              <div
                className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary/20 rounded-br"
                aria-hidden="true"
              />

              <Card.Content className="p-8 text-center relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mx-auto mb-4 ring-1 ring-primary/10">
                  <HelpCircle size={24} className="text-primary" />
                </div>
                <h2 id="contacto" className="text-xl font-bold text-foreground mb-2 scroll-mt-24">
                  ¿Necesitas más ayuda?
                </h2>
                <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                  Contacta al administrador del sistema para reportar problemas o
                  solicitar cambios.
                </p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm text-primary/70 font-medium">
                  <Mail size={14} />
                  <span>admin@code-craft.com</span>
                </div>
              </Card.Content>
            </Card.Root>
          </motion.div>
        </main>
      </div>
    </motion.div>
  );
}
