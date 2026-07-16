import { Button, Spinner } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Save, X } from 'lucide-react';
import { useState } from 'react';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas/security-questions.schema';
import { securityQuestionsService } from '../services/security-questions.service';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';

export function ChangePasswordForm() {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await securityQuestionsService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      sileo.success({ title: 'Contraseña actualizada exitosamente', description: 'Su nueva contraseña está activa.' });
      setSuccess(true);
      reset();
      setEditing(false);
    } catch (err: unknown) {
      const msg = extractApiError(err, 'Error al cambiar la contraseña');
      setError(msg);
      sileo.error({ title: msg, description: 'Verifique su contraseña actual.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCancel = () => {
    reset();
    setEditing(false);
    setError(null);
    setSuccess(false);
  };

  if (!editing) {
    return (
      <Button variant="ghost" onPress={() => setEditing(true)} size="sm">
        <Lock size={14} />
        Cambiar contraseña
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Contraseña actual" help="Tu contraseña actual" htmlFor="currentPassword" className="text-xs text-muted uppercase tracking-wider" />
        <PasswordInput
          id="currentPassword"
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <p className="text-danger text-xs">{errors.currentPassword.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Nueva contraseña" help="Mínimo 6 caracteres" htmlFor="newPassword" className="text-xs text-muted uppercase tracking-wider" />
        <PasswordInput
          id="newPassword"
          {...register('newPassword')}
        />
        {errors.newPassword && (
          <p className="text-danger text-xs">{errors.newPassword.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <FieldLabel label="Confirmar nueva contraseña" help="Repite la nueva contraseña" htmlFor="confirmPassword" className="text-xs text-muted uppercase tracking-wider" />
        <PasswordInput
          id="confirmPassword"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-danger text-xs">{errors.confirmPassword.message}</p>
        )}
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
          <p className="text-danger text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/20 rounded-lg px-3 py-2">
          <p className="text-success text-sm">Contraseña actualizada correctamente</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="primary" type="submit" isDisabled={!isDirty || isSubmitting}>
          {isSubmitting ? <Spinner size="sm" /> : <Save size={14} />}
          Guardar
        </Button>
        <Button variant="ghost" onPress={onCancel}>
          <X size={14} />
          Cancelar
        </Button>
      </div>
    </form>
  );
}