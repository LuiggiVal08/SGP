import { Button, Input, Card, Spinner } from '@heroui/react';
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
  const [resetToken, setResetToken] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
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
      setResetToken(result.resetToken);
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
        resetToken,
        answers: [
          { questionId: questions[0].id, answer: data.answer1 },
          { questionId: questions[1].id, answer: data.answer2 },
          { questionId: questions[2].id, answer: data.answer3 },
        ],
      });
      setVerificationToken(result.verificationToken);
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
        verificationToken,
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-surface to-surface-secondary p-4">
      <Card.Root className="w-full max-w-md border border-border shadow-xl">
        <Card.Content className="p-8">
          {step !== 'done' && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Recuperar acceso</h1>
              <p className="text-sm text-muted mt-1">
                {step === 'email' && 'Ingrese su email para comenzar'}
                {step === 'questions' && 'Responda sus preguntas de seguridad'}
                {step === 'reset' && 'Establezca una nueva contraseña'}
              </p>
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Email" help="Correo con el que te registraste" htmlFor="email" className="text-xs text-muted uppercase tracking-wider" />
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@sgp.com"
                  {...emailForm.register('email')}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-danger text-xs">{emailForm.formState.errors.email.message}</p>
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
                  <label className="text-xs text-muted uppercase tracking-wider" htmlFor={`answer-${idx}`}>
                    Pregunta {idx + 1}
                  </label>
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
        </Card.Content>
      </Card.Root>
    </div>
  );
}
