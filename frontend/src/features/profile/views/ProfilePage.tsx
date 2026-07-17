import { Avatar, Card, Chip, Button, Input, Accordion, Spinner, Skeleton } from '@heroui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Shield, IdCard, Building, GraduationCap, Edit2, Save, X, CheckCircle2, Lock, ShieldQuestion, Phone } from 'lucide-react';
import { useState } from 'react';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { profileSchema, type ProfileFormValues } from '../schemas/profile.schema';
import { sileo } from 'sileo';
import { usePnf } from '@/features/catalogs/hooks/usePnf';
import { useInstitutions } from '@/features/catalogs/hooks/useInstitutions';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { PhoneInputField } from '@/shared/components/PhoneInput';
import { applyPhoneMask } from '@/shared/utils/formatters';
import { ChangePasswordForm } from '@/features/security-questions/components/ChangePasswordForm';
import { SecurityQuestionsForm } from '@/features/security-questions/components/SecurityQuestionsForm';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

const roleConfig: Record<string, { label: string; color: 'success' | 'warning' | 'default' }> = {
  ADMIN: { label: 'Administrador', color: 'success' },
  IRCOP: { label: 'Administrador suplente', color: 'success' },
  DOCENTE: { label: 'Docente', color: 'warning' },
  STUDENT: { label: 'Estudiante', color: 'default' },
};

export default function ProfilePage() {
  usePageTitle('Mi Perfil');
  const { data: user, isLoading, isError } = useProfile();
  const updateMutation = useUpdateProfile();
  const { data: pnfs = [] } = usePnf();
  const { data: institutions = [] } = useInstitutions();
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: user ? { firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone ?? '' } : undefined,
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card.Root variant="secondary" className="border border-border">
          <Skeleton className="h-28 w-full rounded-t-xl" />
          <Card.Content className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48 rounded-lg" />
                <Skeleton className="h-4 w-32 rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-2xl mx-auto mt-8 text-center py-12">
        <p className="text-muted">Error al cargar el perfil</p>
        <Button variant="primary" className="mt-4" onPress={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  const pnfName = pnfs.find((c) => c.id === user.pnfId)?.name ?? 'No asignada';
  const institutionName = institutions.find((i) => i.id === user.institutionId)?.name ?? 'No asignada';

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const role = roleConfig[user.role] ?? { label: user.role, color: 'default' as const };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateMutation.mutateAsync(data);
      sileo.success({ title: 'Perfil actualizado exitosamente', description: 'Sus cambios han sido guardados.' });
      setEditing(false);
    } catch {
      sileo.error({ title: 'Error al actualizar el perfil', description: 'Ocurrió un problema al guardar los cambios.' });
    }
  };

  const onCancel = () => {
    reset();
    setEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card.Root variant="secondary" className="border border-border">
        <div className="h-32 bg-gradient-to-br from-primary/35 via-accent/25 to-primary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,oklch(62.04%_0.195_253.83/0.08)_0%,transparent_60%)]" />
        </div>

        <Card.Content className="px-6 pb-6">
          <div className="-mt-14 mb-4 flex items-end justify-between">
            <Avatar size="lg" color="accent" className="ring-4 ring-background shadow-lg">
              <Avatar.Fallback className="text-lg">{initials}</Avatar.Fallback>
            </Avatar>
            <div className="flex items-center gap-2">
              {user.isActive ? (
                <Chip color="success" variant="soft" size="sm">Activo</Chip>
              ) : (
                <Chip color="danger" variant="soft" size="sm">Inactivo</Chip>
              )}
              <Chip color={role.color} variant="soft" size="sm">
                {role.label}
              </Chip>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel label="Nombre" help="Nombre(s) del usuario" htmlFor="firstName" className="text-xs text-muted uppercase tracking-wider" />
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className="[&_[data-slot=input-wrapper]]:bg-surface-secondary/50"
                  />
                  {errors.firstName && <p className="text-danger text-xs">{errors.firstName.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel label="Apellido" help="Apellido(s) del usuario" htmlFor="lastName" className="text-xs text-muted uppercase tracking-wider" />
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className="[&_[data-slot=input-wrapper]]:bg-surface-secondary/50"
                  />
                  {errors.lastName && <p className="text-danger text-xs">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Email" help="Correo electrónico del usuario" htmlFor="email" className="text-xs text-muted uppercase tracking-wider" />
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="[&_[data-slot=input-wrapper]]:bg-surface-secondary/50"
                />
                {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel label="Teléfono" help="Formato internacional" htmlFor="phone" className="text-xs text-muted uppercase tracking-wider" />
                <PhoneInputField
                  id="phone"
                  value={watch('phone')}
                  onChange={(v) => setValue('phone', v ?? '', { shouldValidate: true })}
                  error={errors.phone?.message}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="primary" type="submit" isDisabled={!isDirty || updateMutation.isPending}>
                  <Save size={14} />
                  {updateMutation.isPending ? <Spinner size="sm" /> : 'Guardar'}
                </Button>
                <Button variant="ghost" onPress={onCancel}>
                  <X size={14} />
                  Cancelar
                </Button>
              </div>

              {updateMutation.isError && (
                <div className="bg-danger/10 border border-danger/20 rounded-lg px-3 py-2">
                  <p className="text-danger text-sm">Error al guardar. Intente nuevamente.</p>
                </div>
              )}
            </form>
          ) : (
            <>
              <div className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
                <h1 className="text-2xl font-bold text-foreground pl-3">
                  {user.firstName} {user.lastName}
                </h1>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary"><Mail size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted uppercase tracking-wider">Email</p>
                    <p className="text-sm text-foreground font-medium truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent"><Shield size={16} /></div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider">Rol</p>
                    <p className="text-sm text-foreground font-medium">{role.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning"><IdCard size={16} /></div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider">DNI</p>
                    <p className="text-sm text-foreground font-medium">{user.dni}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-success/10 text-success"><CheckCircle2 size={16} /></div>
                  <div>
                    <p className="text-xs text-muted uppercase tracking-wider">Estado</p>
                    <p className="text-sm text-foreground font-medium">{user.isActive ? 'Activo' : 'Inactivo'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent"><Phone size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted uppercase tracking-wider">Teléfono</p>
                    <p className="text-sm text-foreground font-medium truncate">{user.phone ? applyPhoneMask(user.phone) : 'No registrado'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-secondary/10 text-secondary"><GraduationCap size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted uppercase tracking-wider">PNF</p>
                    <p className="text-sm text-foreground font-medium truncate">{pnfName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent"><Building size={16} /></div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted uppercase tracking-wider">Institución</p>
                    <p className="text-sm text-foreground font-medium truncate">{institutionName}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="secondary" onPress={() => setEditing(true)}>
                  <Edit2 size={14} />
                  Editar perfil
                </Button>
              </div>

              <Accordion className="mt-8" variant="surface">
                <Accordion.Item>
                  <Accordion.Heading>
                    <Accordion.Trigger>
                      <div className="flex items-center gap-2">
                        <Lock size={16} />
                        <span>Cambiar contraseña</span>
                      </div>
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body>
                      <ChangePasswordForm />
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item>
                  <Accordion.Heading>
                    <Accordion.Trigger>
                      <div className="flex items-center gap-2">
                        <ShieldQuestion size={16} />
                        <span>Preguntas de seguridad</span>
                      </div>
                    </Accordion.Trigger>
                  </Accordion.Heading>
                  <Accordion.Panel>
                    <Accordion.Body>
                      <SecurityQuestionsForm />
                    </Accordion.Body>
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </>
          )}
        </Card.Content>
      </Card.Root>
    </div>
  );
}