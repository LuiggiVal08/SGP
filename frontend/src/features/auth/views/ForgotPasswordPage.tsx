import { Button, Input, Spinner } from '@heroui/react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { securityQuestionsService } from '@/features/security-questions/services/security-questions.service';
import {
  forgotPasswordEmailSchema,
  forgotPasswordAnswersSchema,
  forgotPasswordResetSchema,
  type ForgotPasswordEmailValues,
  type ForgotPasswordAnswersValues,
  type ForgotPasswordResetValues,
} from '@/features/security-questions/schemas/security-questions.schema';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { extractApiError } from '@/shared/utils/extractApiError';

type Step = 'email' | 'questions' | 'reset' | 'done';

export default function ForgotPasswordPage() {
  usePageTitle('Recuperar Contraseña');
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [identifier, setIdentifier] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [questions, setQuestions] = useState<Array<{ id: string; questionText: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<ForgotPasswordEmailValues>({
    resolver: zodResolver(forgotPasswordEmailSchema),
  });

  const answersForm = useForm<ForgotPasswordAnswersValues>({
    resolver: zodResolver(forgotPasswordAnswersSchema),
  });

  const resetForm = useForm<ForgotPasswordResetValues>({
    resolver: zodResolver(forgotPasswordResetSchema),
  });

  const onEmailSubmit = async (data: ForgotPasswordEmailValues) => {
    setError(null);
    setLoading(true);
    try {
      const result = await securityQuestionsService.forgotPasswordInit(data);
      setIdentifier(data.identifier);
      setQuestions(result.questions);
      setStep('questions');
    } catch (err: unknown) {
      setError(extractApiError(err, 'Error al iniciar recuperación'));
    } finally {
      setLoading(false);
    }
  };

  const onAnswersSubmit = async (data: ForgotPasswordAnswersValues) => {
    setError(null);
    setLoading(true);
    try {
      const result = await securityQuestionsService.forgotPasswordVerify({
        identifier,
        answers: [
          { questionId: questions[0].id, answer: data.answer1 },
          { questionId: questions[1].id, answer: data.answer2 },
          { questionId: questions[2].id, answer: data.answer3 },
        ],
      });
      setResetToken(result.resetToken);
      setStep('reset');
    } catch (err: unknown) {
      setError(extractApiError(err, 'Respuestas incorrectas'));
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ForgotPasswordResetValues) => {
    setError(null);
    setLoading(true);
    try {
      await securityQuestionsService.forgotPasswordReset({
        resetToken,
        newPassword: data.newPassword,
      });
      setStep('done');
    } catch (err: unknown) {
      setError(extractApiError(err, 'Error al restablecer contraseña'));
    } finally {
      setLoading(false);
    }
  };

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
          <span className="font-display text-lg font-semibold tracking-tight">SGP</span>
        </div>

        <div className="relative max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight tracking-tight">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="mt-4 text-white/80 text-base leading-relaxed">
            Recupera el acceso a tu cuenta respondiendo tus preguntas de
            seguridad. Es rápido y seguro.
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
          {step !== 'done' && (
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                Recuperar acceso
              </h1>
              <p className="text-sm text-muted mt-1.5">
                {step === 'email' && 'Ingresa tu email o DNI para comenzar.'}
                {step === 'questions' && 'Responde tus preguntas de seguridad.'}
                {step === 'reset' && 'Establece una nueva contraseña.'}
              </p>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Email o DNI" help="Con el que te registraste" htmlFor="identifier" className="text-xs text-muted uppercase tracking-wider" />
                <Input
                  id="identifier"
                  type="text"
                  placeholder="usuario@sgp.com"
                  {...emailForm.register('identifier')}
                />
                {emailForm.formState.errors.identifier && (
                  <p className="text-danger text-xs">{emailForm.formState.errors.identifier.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              )}

              <Button variant="primary" type="submit" className="w-full" isDisabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Continuar'}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  <ArrowLeft size={14} />
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}

          {step === 'questions' && (
            <form onSubmit={answersForm.handleSubmit(onAnswersSubmit)} className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex flex-col gap-1.5">
                  <FieldLabel label={`Pregunta ${idx + 1}`} help="Responde exactamente como la configuraste al registrarte" htmlFor={`answer-${idx}`} className="text-xs text-muted uppercase tracking-wider" />
                  <p className="text-sm text-foreground font-medium">{q.questionText}</p>
                  <Input
                    id={`answer-${idx}`}
                    type="text"
                    placeholder="Su respuesta"
                    {...answersForm.register(`answer${(idx + 1) as 1 | 2 | 3}` as const)}
                  />
                  {answersForm.formState.errors[`answer${(idx + 1) as 1 | 2 | 3}` as keyof typeof answersForm.formState.errors] && (
                    <p className="text-danger text-xs">
                      {answersForm.formState.errors[`answer${(idx + 1) as 1 | 2 | 3}` as keyof typeof answersForm.formState.errors]?.message}
                    </p>
                  )}
                </div>
              ))}

              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              )}

              <Button variant="primary" type="submit" className="w-full" isDisabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Verificar respuestas'}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(null); }}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Volver al email
                </button>
              </div>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Nueva contraseña" help="Mínimo 6 caracteres" htmlFor="newPassword" className="text-xs text-muted uppercase tracking-wider" />
                <PasswordInput
                  id="newPassword"
                  {...resetForm.register('newPassword')}
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-danger text-xs">{resetForm.formState.errors.newPassword.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Confirmar contraseña" help="Repite la nueva contraseña" htmlFor="confirmPassword" className="text-xs text-muted uppercase tracking-wider" />
                <PasswordInput
                  id="confirmPassword"
                  {...resetForm.register('confirmPassword')}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-danger text-xs">{resetForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                  <p className="text-danger text-sm">{error}</p>
                </div>
              )}

              <Button variant="primary" type="submit" className="w-full" isDisabled={loading}>
                {loading ? <Spinner size="sm" /> : 'Restablecer contraseña'}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setStep('questions'); setError(null); }}
                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} />
                  Volver a preguntas
                </button>
              </div>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-success/10">
                  <CheckCircle2 size={40} className="text-success" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Contraseña restablecida</h1>
              <p className="text-sm text-muted">
                Su contraseña ha sido actualizada correctamente. Ya puede iniciar sesión con su nueva contraseña.
              </p>
              <Button
                variant="primary"
                className="w-full"
                onPress={() => navigate('/login')}
              >
                Iniciar sesión
              </Button>
            </div>
          )}
        </motion.div>
      </section>
    </main>
  );
}
