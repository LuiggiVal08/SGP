import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  Input,
  Chip,
  Card,
  Skeleton,
  Spinner,
  Select,
  ListBox,
  ComboBox,
  NumberField,
  Popover,
  Switch,
  TextArea,
} from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, GraduationCap, User, Users, Calendar, Check, Building, BookOpen } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { usePnf } from '@/features/catalogs/hooks/usePnf';
import { useInstitutions } from '@/features/catalogs/hooks/useInstitutions';
import { useUsers } from '@/features/catalogs/hooks/useUsers';
import { projectService } from '../services/project.service';
import type { CommunityTutorData, CreateProjectPayload } from '../types/project.types';
import { sileo } from 'sileo';
import { useAuthStore } from '@/shared/store/auth.store';
import { isAdmin } from '@/shared/utils/role';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { PhoneInputField } from '@/shared/components/PhoneInput';
import { formatDni, stripFormatting } from '@/shared/utils/formatters';

const steps = ['Información básica', 'Autores y Tutor', 'Tutor Comunitario', 'Revisar'];

const stepFields: Record<number, (keyof ProjectFormData)[]> = {
  0: ['title', 'year', 'pnfId', 'methodology'],
  1: ['authorIds', 'tutorId'],
  2: [],
  3: [],
};

const projectSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  year: z.number().int().min(1900).max(2100),
  pnfId: z.string().uuid('Selecciona una PNF'),
  authorIds: z.array(z.string().uuid()).min(2, 'Agrega al menos 2 autores').max(5, 'Máximo 5 autores'),
  tutorId: z.string().uuid('Selecciona un tutor'),
  isExceptional: z.boolean().optional(),
  methodology: z.string().optional(),
  communityTutor: z.object({
    fullName: z.string().optional(),
    dni: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    organization: z.string().optional(),
    position: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function CreateProjectForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const { data: institutions = [], isLoading: loadingInstitutions } = useInstitutions();
  const { data: pnfs = [], isLoading: loadingPnfs } = usePnf(selectedInstitution || undefined);
  const { data: students = [], isLoading: loadingStudents } =
    useUsers('STUDENT');
  const { data: tutors = [], isLoading: loadingTutors } = useUsers('DOCENTE');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { authorIds: [], year: new Date().getFullYear() },
  });

  const selectedAuthorIds = watch('authorIds');
  const isExceptional = watch('isExceptional');
  const maxAuthors = isExceptional ? 5 : 3;

  const user = useAuthStore((s) => s.user);

  const mutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      projectService.create(payload),
    onSuccess: () => {
      sileo.success({ title: 'Proyecto creado exitosamente', description: 'El proyecto se ha registrado en el sistema.' });
      navigate('/', { replace: true });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear el proyecto', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const toggleAuthor = (id: string) => {
    const current = selectedAuthorIds;
    if (current.includes(id)) {
      setValue(
        'authorIds',
        current.filter((a) => a !== id),
        { shouldValidate: true },
      );
    } else if (current.length < maxAuthors) {
      setValue('authorIds', [...current, id], { shouldValidate: true });
    }
  };

  const handleNext = useCallback(async () => {
    const fields = stepFields[step];
    if (fields.length === 0) {
      setStep((s) => s + 1);
      return;
    }
    setIsAdvancing(true);
    const valid = await trigger(fields);
    setIsAdvancing(false);
    if (valid) setStep((s) => s + 1);
  }, [step, trigger]);

  const onSubmit = (data: ProjectFormData) => {
    const payload: CreateProjectPayload = {
      title: data.title,
      year: data.year,
      pnfId: data.pnfId,
      authorIds: data.authorIds,
      tutorId: data.tutorId,
      isExceptional: data.isExceptional,
      methodology: data.methodology || undefined,
    };
    if (data.communityTutor?.fullName) {
      payload.communityTutor = {
        fullName: data.communityTutor.fullName,
        dni: data.communityTutor.dni ? stripFormatting(data.communityTutor.dni) : undefined,
        phone: data.communityTutor.phone ?? '',
        email: data.communityTutor.email ?? '',
        organization: data.communityTutor.organization ?? '',
        position: data.communityTutor.position ?? '',
        notes: data.communityTutor.notes,
      };
    }
    mutation.mutate(payload);
  };

  const ct = watch('communityTutor');

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-initial">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shrink-0 ${
                  i < step
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/30'
                    : i === step
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
                      : 'bg-surface-secondary text-muted'
                }`}
              >
                {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={`text-sm hidden sm:inline transition-colors ${
                  i <= step ? 'text-foreground font-medium' : 'text-muted'
                }`}
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 hidden sm:block transition-colors duration-300 ${
                  i < step ? 'bg-primary' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form className="space-y-6">
        {step === 0 && (
          <Card.Root variant="secondary" className="border border-border">
            <Card.Content className="p-6 space-y-4">
              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
                <h2 className="text-xl font-semibold pl-3">
                  Información del Proyecto
                </h2>
              </div>

              <div className="flex flex-col gap-1">
                <FieldLabel label="Título del Proyecto" help="Título descriptivo del proyecto. Mínimo 3 caracteres" htmlFor="title" className="text-sm" />
                <Input
                  id="title"
                  placeholder="Ej: Sistema de Gestión..."
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-danger text-xs">{errors.title.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <FieldLabel label="Año" help="Año de realización del proyecto. Ej: 2024" htmlFor="year" className="text-sm" />
                  <Popover.Root>
                    <Popover.Trigger>
                      <button
                        type="button"
                        className="text-muted hover:text-foreground transition-colors"
                        aria-label="Ayuda: Año"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </Popover.Trigger>
                    <Popover.Content className="bg-surface border border-border rounded-lg shadow-lg p-3 max-w-60 text-xs text-muted">
                      Año académico en que se registra el proyecto. Debe estar
                      entre 1900 y 2100.
                    </Popover.Content>
                  </Popover.Root>
                </div>
                <NumberField
                  aria-label="Año del proyecto"
                  value={watch('year')}
                  onChange={(val) =>
                    setValue('year', val, { shouldValidate: true })
                  }
                  minValue={1900}
                  maxValue={2100}
                />
                {errors.year && (
                  <p className="text-danger text-xs">{errors.year.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <FieldLabel label="Institución" help="Institución donde se desarrolla el proyecto" htmlFor="institutionId" className="text-sm" />
                {loadingInstitutions ? (
                  <Skeleton className="h-10 w-full rounded-lg" />
                ) : (
                  <Select
                    aria-label="Seleccionar institución"
                    selectedKey={selectedInstitution || null}
                    onSelectionChange={(key) => {
                      setSelectedInstitution(key as string);
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
                        {institutions.map((inst) => (
                          <ListBox.Item
                            key={inst.id}
                            id={inst.id}
                            textValue={inst.name}
                            className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary"
                          >
                            {inst.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <FieldLabel label="PNF" help="Programa Nacional de Formación del proyecto" htmlFor="pnfId" className="text-sm" />
                {!selectedInstitution ? (
                  <p className="text-xs text-muted py-2">Selecciona una institución primero</p>
                ) : loadingPnfs ? (
                  <Skeleton className="h-10 w-full rounded-lg" />
                ) : (
                  <Select
                    aria-label="Seleccionar PNF"
                    selectedKey={watch('pnfId') || null}
                    onSelectionChange={(key) =>
                      setValue('pnfId', key as string, {
                        shouldValidate: true,
                      })
                    }
                    placeholder="Seleccionar PNF"
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {pnfs.map((c) => (
                          <ListBox.Item
                            key={c.id}
                            id={c.id}
                            textValue={c.name}
                            className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary"
                          >
                            {c.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                )}
                {errors.pnfId && (
                  <p className="text-danger text-xs">
                    {errors.pnfId.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <FieldLabel label="Metodología" help="Metodología de desarrollo aplicada" htmlFor="methodology" className="text-sm" />
                <Select
                  aria-label="Seleccionar metodología"
                  selectedKey={watch('methodology') || null}
                  onSelectionChange={(key) =>
                    setValue('methodology', key as string, {
                      shouldValidate: true,
                    })
                  }
                  placeholder="Seleccionar metodología"
                >
                  <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                    <ListBox>
                      {[
                        'Cuantitativa',
                        'Cualitativa',
                        'Mixta',
                        'Investigación-Acción',
                        'Experimental',
                        'No experimental',
                        'Documental',
                        'De campo',
                        'Proyecto factible',
                      ].map((m) => (
                        <ListBox.Item
                          key={m}
                          id={m}
                          textValue={m}
                          className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary"
                        >
                          {m}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
            </Card.Content>
          </Card.Root>
        )}

        {step === 1 && (
          <Card.Root variant="secondary" className="border border-border">
            <Card.Content className="p-6 space-y-4">
              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
                <h2 className="text-xl font-semibold pl-3">Autores y Tutor</h2>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <FieldLabel label={`Autores (máx. ${maxAuthors})`} help="Estudiantes autores del proyecto. Entre 2 y 5" htmlFor="authors" className="text-sm" />
                  <Popover.Root>
                    <Popover.Trigger>
                      <button
                        type="button"
                        className="text-muted hover:text-foreground transition-colors"
                        aria-label="Ayuda: Autores"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </Popover.Trigger>
                    <Popover.Content className="bg-surface border border-border rounded-lg shadow-lg p-3 max-w-60 text-xs text-muted">
                      Selecciona los estudiantes autores del proyecto. Puedes
                      agregar hasta {maxAuthors} autores usando el buscador.
                    </Popover.Content>
                  </Popover.Root>
                </div>
                {isAdmin(user?.role) && (
                  <div className="flex items-center gap-2 my-1">
                    <Switch
                      size="sm"
                      isSelected={isExceptional ?? false}
                      onChange={(val: boolean) => setValue('isExceptional', val)}
                    >
                      <span className="text-xs text-muted">Caso excepcional (aprobado por consejo)</span>
                    </Switch>
                  </div>
                )}
                {selectedAuthorIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {selectedAuthorIds.map((id) => {
                      const s = students.find((st) => st.id === id);
                      return s ? (
                        <Chip
                          key={id}
                          color="success"
                          variant="primary"
                          onClick={() => toggleAuthor(id)}
                          className="cursor-pointer"
                        >
                          {s.firstName} {s.lastName}
                        </Chip>
                      ) : null;
                    })}
                  </div>
                )}
                {loadingStudents ? (
                  <Skeleton className="h-10 w-full rounded-lg" />
                ) : selectedAuthorIds.length >= maxAuthors ? (
                  <p className="text-sm text-success">
                    Máximo de autores alcanzado
                  </p>
                ) : (
                  <ComboBox
                    selectedKey={null}
                    onSelectionChange={(key) => {
                      if (key) toggleAuthor(key as string);
                    }}
                  >
                    <ComboBox.InputGroup>
                      <Input placeholder="Buscar estudiante…" />
                      <ComboBox.Trigger />
                    </ComboBox.InputGroup>
                    <ComboBox.Popover>
                      <ListBox>
                        {students.filter(
                          (s) => !selectedAuthorIds.includes(s.id),
                        ).length === 0 ? (
                          <ListBox.Item
                            id=""
                            textValue="No hay estudiantes disponibles"
                            className="px-3 py-2 text-sm text-muted"
                            isDisabled
                          >
                            No hay estudiantes disponibles
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ) : (
                          students
                            .filter((s) => !selectedAuthorIds.includes(s.id))
                            .map((s) => (
                              <ListBox.Item
                                key={s.id}
                                id={s.id}
                                textValue={`${s.firstName} ${s.lastName}`}
                              >
                                {s.firstName} {s.lastName}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))
                        )}
                      </ListBox>
                    </ComboBox.Popover>
                  </ComboBox>
                )}
                {errors.authorIds && (
                  <p className="text-danger text-xs">
                    {errors.authorIds.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <FieldLabel label="Tutor" help="Docente tutor que guía el proyecto" htmlFor="tutorId" className="text-sm" />
                  <Popover.Root>
                    <Popover.Trigger>
                      <button
                        type="button"
                        className="text-muted hover:text-foreground transition-colors"
                        aria-label="Ayuda: Tutor"
                      >
                        <HelpCircle size={14} />
                      </button>
                    </Popover.Trigger>
                    <Popover.Content className="bg-surface border border-border rounded-lg shadow-lg p-3 max-w-60 text-xs text-muted">
                      Selecciona el tutor que supervisará el proyecto. El tutor
                      debe estar registrado en el sistema.
                    </Popover.Content>
                  </Popover.Root>
                </div>
                {loadingTutors ? (
                  <Skeleton className="h-10 w-full rounded-lg" />
                ) : (
                  <ComboBox
                    selectedKey={watch('tutorId') || null}
                    onSelectionChange={(key) =>
                      setValue('tutorId', key as string, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <ComboBox.InputGroup className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Input placeholder="Buscar tutor…" />
                      <ComboBox.Trigger />
                    </ComboBox.InputGroup>
                    <ComboBox.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {tutors.length === 0 ? (
                          <ListBox.Item
                            id=""
                            textValue="No hay tutores disponibles"
                            className="px-3 py-2 text-sm text-muted"
                            isDisabled
                          >
                            No hay tutores disponibles
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ) : (
                          tutors.map((t) => (
                            <ListBox.Item
                              key={t.id}
                              id={t.id}
                              textValue={`${t.firstName} ${t.lastName}`}
                              className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary"
                            >
                              {t.firstName} {t.lastName}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))
                        )}
                      </ListBox>
                    </ComboBox.Popover>
                  </ComboBox>
                )}
                {errors.tutorId && (
                  <p className="text-danger text-xs">
                    {errors.tutorId.message}
                  </p>
                )}
              </div>
            </Card.Content>
          </Card.Root>
        )}

        {step === 2 && (
          <Card.Root variant="secondary" className="border border-border">
            <Card.Content className="p-6 space-y-4">
              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
                <h2 className="text-xl font-semibold pl-3">Tutor Comunitario</h2>
              </div>
              <p className="text-sm text-muted">
                Datos del tutor asignado por la organización o comunidad donde se realiza el proyecto. Opcional.
              </p>

              <div className="flex flex-col gap-1">
                <FieldLabel label="Nombre completo" help="Nombre y apellido del tutor de la comunidad" htmlFor="ct-name" className="text-sm" />
                <Input
                  id="ct-name"
                  placeholder="Ej: Juan Pérez"
                  value={ct?.fullName ?? ''}
                  onChange={(e) => setValue('communityTutor', { ...(ct ?? {}), fullName: e.target.value } as CommunityTutorData)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Cédula de identidad" help="Cédula del tutor. Ej: 12.345.678" htmlFor="ct-dni" className="text-sm" />
                  <Input
                    id="ct-dni"
                    placeholder="Ej: 28 532 259"
                    value={ct?.dni ?? ''}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setValue('communityTutor', { ...(ct ?? {}), dni: formatDni(raw) } as CommunityTutorData);
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Teléfono" help="Teléfono de contacto. Ej: 0412-1234567" htmlFor="ct-phone" className="text-sm" />
                  <PhoneInputField
                    value={ct?.phone ?? ''}
                    onChange={(val) => setValue('communityTutor', { ...(ct ?? {}), phone: val ?? '' } as CommunityTutorData)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Email" help="Correo electrónico del tutor comunitario" htmlFor="ct-email" className="text-sm" />
                  <Input
                    id="ct-email"
                    type="email"
                    placeholder="Ej: juan@comunidad.org"
                    value={ct?.email ?? ''}
                    onChange={(e) => setValue('communityTutor', { ...(ct ?? {}), email: e.target.value } as CommunityTutorData)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Organización" help="Consejo comunal u organización que representa" htmlFor="ct-org" className="text-sm" />
                  <Input
                    id="ct-org"
                    placeholder="Ej: Consejo Comunal"
                    value={ct?.organization ?? ''}
                    onChange={(e) => setValue('communityTutor', { ...(ct ?? {}), organization: e.target.value } as CommunityTutorData)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Cargo" help="Rol dentro de la comunidad. Ej: Vocero" htmlFor="ct-position" className="text-sm" />
                  <Input
                    id="ct-position"
                    placeholder="Ej: Presidente"
                    value={ct?.position ?? ''}
                    onChange={(e) => setValue('communityTutor', { ...(ct ?? {}), position: e.target.value } as CommunityTutorData)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Notas" help="Información adicional" htmlFor="ct-notes" className="text-sm" />
                  <TextArea
                    id="ct-notes"
                    placeholder="Ej: Contacto vía WhatsApp"
                    value={ct?.notes ?? ''}
                    onChange={(e) => setValue('communityTutor', { ...(ct ?? {}), notes: e.target.value } as CommunityTutorData)}
                  />
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        )}

        {step === 3 && (
          <Card.Root variant="secondary" className="border border-border">
            <Card.Content className="p-6 space-y-4">
              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
                <h2 className="text-xl font-semibold pl-3">Revisar</h2>
              </div>
              <p className="text-sm text-muted">
                Confirme los datos antes de crear el proyecto.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border sm:col-span-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <GraduationCap size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted uppercase tracking-wider">PNF</p>
                    <p className="text-sm text-foreground font-medium truncate">
                      {pnfs.find((c) => c.id === watch('pnfId'))?.name ?? watch('pnfId')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-accent/10 text-accent shrink-0">
                    <User size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted uppercase tracking-wider">Tutor</p>
                    <p className="text-sm text-foreground font-medium truncate">
                      {tutors.find((t) => t.id === watch('tutorId'))
                        ? `${tutors.find((t) => t.id === watch('tutorId'))!.firstName} ${tutors.find((t) => t.id === watch('tutorId'))!.lastName}`
                        : watch('tutorId')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted uppercase tracking-wider">Año</p>
                    <p className="text-sm text-foreground font-medium">{watch('year')}</p>
                  </div>
                </div>
                {watch('methodology') && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
                      <BookOpen size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted uppercase tracking-wider">Metodología</p>
                      <p className="text-sm text-foreground font-medium">{watch('methodology')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border sm:col-span-2">
                  <div className="p-2 rounded-lg bg-success/10 text-success shrink-0">
                    <Users size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted uppercase tracking-wider mb-1">Autores</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAuthorIds.length > 0 ? (
                        selectedAuthorIds.map((id) => {
                          const s = students.find((st) => st.id === id);
                          return s ? (
                            <span
                              key={id}
                              className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-surface-secondary px-2 py-0.5 rounded-full border border-border/50"
                            >
                              {s.firstName} {s.lastName}
                            </span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-sm text-muted">Sin autores</span>
                      )}
                    </div>
                  </div>
                </div>
                {ct?.fullName && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border sm:col-span-2">
                    <div className="p-2 rounded-lg bg-secondary/10 text-secondary shrink-0">
                      <Building size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted uppercase tracking-wider">Tutor Comunitario</p>
                      <p className="text-sm text-foreground font-medium">{ct.fullName}</p>
                      {ct.dni && <p className="text-xs text-muted">C.I. {ct.dni}</p>}
                      <p className="text-xs text-muted">{ct.organization}{ct.organization && ct.position ? ` — ${ct.position}` : ct.position ? ct.position : ''}</p>
                      {(ct.phone || ct.email) && (
                        <p className="text-xs text-muted mt-0.5">
                          {ct.phone && <span>{ct.phone}</span>}
                          {ct.phone && ct.email && <span> · </span>}
                          {ct.email && <span>{ct.email}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card.Content>
          </Card.Root>
        )}

        <div className="flex justify-between gap-3 pt-2">
          <Button
            variant="ghost"
            type="button"
            isDisabled={step === 0}
            onPress={() => setStep((s) => Math.max(0, s - 1))}
          >
            Anterior
          </Button>
          {step < steps.length - 1 ? (
            <Button
              variant="primary"
              type="button"
              onPress={handleNext}
              isDisabled={isAdvancing}
            >
              {isAdvancing ? <Spinner size="sm" /> : 'Siguiente'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onPress={() => handleSubmit(onSubmit)()}
              isDisabled={mutation.isPending}
            >
              {mutation.isPending ? <Spinner size="sm" /> : 'Crear Proyecto'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
