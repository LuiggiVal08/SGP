import { Card } from '@heroui/react';
import { LoginForm } from '../components/LoginForm';
import { motion } from 'framer-motion';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

const floatAnimation = (duration: number, x: number, y: number) => ({
  animate: {
    x: [0, x, 0],
    y: [0, y, 0],
  },
  transition: { duration, repeat: Infinity, ease: 'easeInOut' as const },
});

export default function LoginPage() {
  usePageTitle('Iniciar Sesión');
  return (
    <main className="min-h-dvh grid place-items-center bg-linear-to-br from-primary/[0.05] via-background to-accent/[0.05] px-4 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-primary)_0%,_transparent_60%)] opacity-[0.04] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--color-accent)_0%,_transparent_60%)] opacity-[0.04] pointer-events-none"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <motion.div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-primary/[0.04]"
          {...floatAnimation(10, 40, -30)}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-accent/[0.04]"
          {...floatAnimation(12, -30, 40)}
        />
        <motion.div
          className="absolute top-1/4 -right-16 w-48 h-48 rounded-full bg-warning/[0.02]"
          {...floatAnimation(8, -20, 20)}
        />
        <motion.div
          className="absolute bottom-1/4 -left-20 w-56 h-56 border border-primary/[0.04] rounded-3xl -rotate-12"
          {...floatAnimation(14, 30, 20)}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center gap-8 w-full max-w-sm relative"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="max-w-32 rounded-2xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25 ring-1 ring-white/10 dark:ring-white/5 overflow-hidden">
            <img src="/logouptt.png" alt="Logo" className="w-full  " />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full relative"
        >
          <div className="absolute -inset-px rounded-2xl bg-linear-to-b from-primary/20 via-accent/10 to-transparent opacity-60" />
          <Card.Root
            variant="secondary"
            className="w-full border border-border/80 bg-surface/70 backdrop-blur-xl shadow-xl relative"
          >
            <Card.Content className="p-6">
              <div className="text-center pb-6">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  SGP
                </h1>
                <p className="text-muted text-sm mt-1">
                  Sistema de Gestión de Proyectos
                </p>
              </div>
              <LoginForm />
            </Card.Content>
          </Card.Root>
        </motion.div>
      </motion.div>
    </main>
  );
}
