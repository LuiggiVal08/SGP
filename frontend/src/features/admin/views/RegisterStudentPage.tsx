import { Button, Input, Card, Spinner, Select, ListBox, Skeleton } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { usePnf } from '@/features/catalogs/hooks/usePnf';
import { useInstitutions } from '@/features/catalogs/hooks/useInstitutions';
import { registerStudentSchema, type RegisterStudentFormData } from '@/features/admin/schemas/register-student.schema';
import { ArrowLeft } from 'lucide-react';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { formatDni, stripFormatting } from '@/shared/utils/formatters';
import { PasswordInput } from '@/shared/components/PasswordInput';
import { PhoneInputField } from '@/shared/components/PhoneInput';
import { FieldLabel } from '@/shared/components/FieldLabel';

export default function RegisterStudentPage() {
  usePageTitle('Admin - Registrar Estudiante');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: institutions = [], isLoading: loadingInstitutions } = useInstitutions();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterStudentFormData>({
    resolver: zodResolver(registerStudentSchema),
    mode: 'onChange',
    defaultValues: {
      pnfId: '',
      institutionId: '',
      currentTrayecto: 1,
    },
  });

  const { data: pnfs = [], isLoading: loadingPnfs } = usePnf(watch('institutionId') || undefined);

  const mutation = useMutation({
    mutationFn: (data: RegisterStudentFormData) => catalogService.registerStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/users', { replace: true });
    },
  });

  return (
    <div className="mx-auto max-w-lg">
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a Usuarios
      </button>

      <div className="relative mb-6">
        <div className="absolute -left-8 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
        <h2 className="text-2xl font-semibold pl-3">Registrar Estudiante</h2>
      </div>

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-6 space-y-4">
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
            <div className="flex flex-col gap-1">
              <FieldLabel label="Cédula" help="Se formatea automáticamente" htmlFor="dni" className="text-sm" />
              <Input id="dni" value={formatDni(watch('dni') ?? '')} onChange={(e) => setValue('dni', stripFormatting(e.target.value), { shouldValidate: true })} placeholder="Ej: 28 532 259" />
              {errors.dni && <p className="text-danger text-xs">{errors.dni.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <FieldLabel label="Nombre" help="Nombre(s) del estudiante" htmlFor="firstName" className="text-sm" />
                <Input id="firstName" {...register('firstName')} placeholder="Ej: Juan" />
                {errors.firstName && <p className="text-danger text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel label="Apellido" help="Apellido(s) del estudiante" htmlFor="lastName" className="text-sm" />
                <Input id="lastName" {...register('lastName')} placeholder="Ej: Pérez" />
                {errors.lastName && <p className="text-danger text-xs">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <FieldLabel label="Email" help="Correo electrónico del estudiante" htmlFor="email" className="text-sm" />
              <Input id="email" {...register('email')} type="email" placeholder="Ej: juan@example.com" />
              {errors.email && <p className="text-danger text-xs">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <FieldLabel label="Contraseña" help="Mínimo 6 caracteres" htmlFor="password" className="text-sm" />
              <PasswordInput id="password" {...register('password')} placeholder="••••••••" />
              {errors.password && <p className="text-danger text-xs">{errors.password.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <FieldLabel label="Nro. Expediente" help="Carnet o matrícula" htmlFor="enrollmentNumber" className="text-sm" />
                <Input id="enrollmentNumber" {...register('enrollmentNumber')} placeholder="Ej: 2025-001" />
                {errors.enrollmentNumber && <p className="text-danger text-xs">{errors.enrollmentNumber.message}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel label="Cohorte" help="Año de ingreso" htmlFor="cohort" className="text-sm" />
                <Input id="cohort" {...register('cohort')} type="number" placeholder="Ej: 2025" />
                {errors.cohort && <p className="text-danger text-xs">{errors.cohort.message}</p>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Trayecto Actual</label>
              <Select
                aria-label="Trayecto actual"
                selectedKey={String(watch('currentTrayecto') ?? 1)}
                onSelectionChange={(key) => setValue('currentTrayecto', Number(key), { shouldValidate: true })}
              >
                <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                  <ListBox>
                    {[1, 2, 3].map((t) => (
                      <ListBox.Item key={t} id={String(t)} textValue={`Trayecto ${t}`} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                        Trayecto {t}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Institución</label>
              {loadingInstitutions ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : (
                <Select
                  aria-label="Institución"
                  selectedKey={watch('institutionId') || null}
                  onSelectionChange={(key) => {
                    setValue('institutionId', key as string, { shouldValidate: true });
                    setValue('pnfId', '', { shouldValidate: true });
                  }}
                  placeholder="Seleccionar institución"
                >
                  <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                    <ListBox>
                      <ListBox.Item id="" textValue="Seleccionar institución">Seleccionar institución
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      {institutions.map((i) => (
                        <ListBox.Item key={i.id} id={i.id} textValue={i.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                          {i.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">PNF</label>
              {loadingPnfs ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : (
                <Select
                  aria-label="PNF"
                  selectedKey={watch('pnfId') || null}
                  onSelectionChange={(key) => setValue('pnfId', key as string, { shouldValidate: true })}
                  placeholder="Seleccionar PNF"
                >
                  <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                    <ListBox>
                      <ListBox.Item id="" textValue="Seleccionar PNF">Seleccionar PNF
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      {pnfs.map((c) => (
                        <ListBox.Item key={c.id} id={c.id} textValue={c.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                          {c.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <FieldLabel label="Teléfono" help="Formato internacional" htmlFor="phone" className="text-sm" />
              <PhoneInputField
                id="phone"
                value={watch('phone')}
                onChange={(v) => setValue('phone', v, { shouldValidate: true })}
                error={errors.phone?.message}
              />
            </div>
            <div className="pt-2">
              <Button variant="primary" type="submit" isDisabled={!isValid || mutation.isPending}>
                {mutation.isPending ? <Spinner size="sm" /> : 'Registrar Estudiante'}
              </Button>
            </div>
            {mutation.isError && (
              <p className="text-danger text-sm text-center">Error al registrar. Verifique los datos.</p>
            )}
            {mutation.isSuccess && (
              <p className="text-success text-sm text-center">Estudiante registrado correctamente.</p>
            )}
          </form>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
