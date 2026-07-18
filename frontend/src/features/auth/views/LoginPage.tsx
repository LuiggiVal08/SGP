import { LoginForm } from '../components/LoginForm';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

export default function LoginPage() {
  usePageTitle('Iniciar Sesión');

  return (
    <main className="min-h-dvh grid lg:grid-cols-2">
      <section
        aria-hidden="true"
        className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-white"
        style={{ backgroundImage: 'var(--gradient-brand)' }}
      >
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-2xl animate-float-1" />
        <div className="absolute bottom-0 -right-20 w-[28rem] h-[28rem] rounded-full bg-white/10 blur-3xl animate-float-2" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 border border-white/15 rounded-3xl animate-float-4" />

        <div className="relative flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm flex items-center justify-center overflow-hidden p-1.5">
            <img src="/logouptt.png" alt="Logo" className="w-full object-contain" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            SGP
          </span>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
            Sistema de Gestión de Proyectos
          </h2>
          <p className="mt-4 text-white/80 text-base leading-relaxed">
            Centraliza, valida y consulta los proyectos académicos de la
            institución en un solo lugar.
          </p>
        </div>

        <p className="relative text-sm text-white/60">
          © {new Date().getFullYear()} · Uso institucional
        </p>
      </section>

      <section className="relative flex items-center justify-center px-6 py-12 bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden mb-8 flex flex-col items-center gap-3">
            <div className="size-14 rounded-2xl flex items-center justify-center overflow-hidden p-2 shadow-lg shadow-primary/25"
              style={{ backgroundImage: 'var(--gradient-brand)' }}>
              <img src="/logouptt.png" alt="Logo" className="w-full object-contain" />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
              Bienvenido
            </h1>
            <p className="text-muted text-sm mt-1.5">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <LoginForm />
        </motion.div>
      </section>
    </main>
  );
}
