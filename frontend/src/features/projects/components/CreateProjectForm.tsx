import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Chip, Card } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useCareers } from '@/features/catalogs/hooks/useCareers';
import { useUsers } from '@/features/catalogs/hooks/useUsers';
import { projectService } from '../services/project.service';
import { Search } from 'lucide-react';

const steps = ['Información básica', 'Autores y Tutor', 'Revisar'];

const stepFields: Record<number, (keyof ProjectFormData)[]> = {
  0: ['title', 'year', 'careerId'],
  1: ['authorIds', 'tutorId'],
  2: [],
};

const projectSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  year: z.coerce.number().int().min(1900).max(2100),
  careerId: z.string().uuid('Selecciona una carrera'),
  authorIds: z.array(z.string().uuid()).min(1, 'Agrega al menos un autor').max(3, 'Máximo 3 autores'),
  tutorId: z.string().uuid('Selecciona un tutor'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export function CreateProjectForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [tutorSearch, setTutorSearch] = useState('');
  const { data: careers = [], isLoading: loadingCareers } = useCareers();
  const { data: students = [], isLoading: loadingStudents } = useUsers('STUDENT');
  const { data: tutors = [], isLoading: loadingTutors } = useUsers('TUTOR');

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

  const mutation = useMutation({
    mutationFn: projectService.create,
    onSuccess: () => {
      navigate('/', { replace: true });
    },
  });

  const toggleAuthor = (id: string) => {
    const current = selectedAuthorIds;
    if (current.includes(id)) {
      setValue('authorIds', current.filter((a) => a !== id), { shouldValidate: true });
    } else if (current.length < 3) {
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
    mutation.mutate(data);
  };

  const filteredStudents = studentSearch
    ? students.filter((s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()),
      )
    : students;

  const filteredTutors = tutorSearch
    ? tutors.filter((t) =>
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(tutorSearch.toLowerCase()),
      )
    : tutors;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center justify-center max-w-md mx-auto">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                    i <= step
                      ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30'
                      : 'bg-surface border-border text-muted'
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-xs mt-1.5 whitespace-nowrap font-medium transition-colors duration-300 ${
                    i <= step ? 'text-foreground' : 'text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-3 rounded-full transition-colors duration-500 ${
                    i < step ? 'bg-primary' : 'bg-surface-tertiary'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {mutation.isPending && (
        <div className="h-1 bg-primary/20 w-full rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-[loadingBar_1.4s_ease-in-out_infinite]" />
        </div>
      )}

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-6">
          <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              {step === 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Información del Proyecto</h2>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="title" className="text-sm">Título del Proyecto</label>
                    <Input id="title" placeholder="Ej: Sistema de Gestión..." {...register('title')} />
                    {errors.title && <p className="text-danger text-xs">{errors.title.message}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="year" className="text-sm">Año</label>
                    <Input id="year" type="number" {...register('year')} />
                    {errors.year && <p className="text-danger text-xs">{errors.year.message}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="careerId" className="text-sm">Carrera</label>
                    {loadingCareers ? (
                      <p className="text-sm text-muted">Cargando carreras…</p>
                    ) : (
                      <select
                        id="careerId"
                        value={watch('careerId') ?? ''}
                        onChange={(e) => setValue('careerId', e.target.value, { shouldValidate: true })}
                        className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
                      >
                        <option value="">Seleccionar carrera</option>
                        {careers.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                    {errors.careerId && <p className="text-danger text-xs">{errors.careerId.message}</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Autores y Tutor</h2>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm">Autores (máx. 3)</label>
                    <div className="flex items-center gap-2 max-w-sm mb-2">
                      <Search size={16} className="text-muted shrink-0" />
                      <Input
                        placeholder="Buscar estudiante…"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                      />
                    </div>
                    {loadingStudents ? (
                      <p className="text-sm text-muted">Cargando estudiantes…</p>
                    ) : filteredStudents.length === 0 ? (
                      <p className="text-sm text-muted">No hay estudiantes disponibles</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
                        {filteredStudents.map((s) => {
                          const selected = selectedAuthorIds.includes(s.id);
                          return (
                            <Chip
                              key={s.id}
                              color={selected ? 'success' : 'default'}
                              variant={selected ? 'primary' : 'soft'}
                              onClick={() => toggleAuthor(s.id)}
                              className="cursor-pointer"
                            >
                              {s.firstName} {s.lastName}
                            </Chip>
                          );
                        })}
                      </div>
                    )}
                    {errors.authorIds && <p className="text-danger text-xs">{errors.authorIds.message}</p>}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label htmlFor="tutorId" className="text-sm">Tutor</label>
                    <div className="flex items-center gap-2 max-w-sm mb-2">
                      <Search size={16} className="text-muted shrink-0" />
                      <Input
                        placeholder="Buscar tutor…"
                        value={tutorSearch}
                        onChange={(e) => setTutorSearch(e.target.value)}
                      />
                    </div>
                    {loadingTutors ? (
                      <p className="text-sm text-muted">Cargando tutores…</p>
                    ) : filteredTutors.length === 0 ? (
                      <p className="text-sm text-muted">No hay tutores disponibles</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 border border-border rounded-lg">
                        {filteredTutors.map((t) => {
                          const selected = watch('tutorId') === t.id;
                          return (
                            <Chip
                              key={t.id}
                              color={selected ? 'success' : 'default'}
                              variant={selected ? 'primary' : 'soft'}
                              onClick={() => setValue('tutorId', t.id, { shouldValidate: true })}
                              className="cursor-pointer"
                            >
                              {t.firstName} {t.lastName}
                            </Chip>
                          );
                        })}
                      </div>
                    )}
                    {errors.tutorId && <p className="text-danger text-xs">{errors.tutorId.message}</p>}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Revisar Proyecto</h2>
                  <div className="bg-surface rounded-lg p-4 space-y-2 text-sm">
                    <p><strong>Título:</strong> {watch('title')}</p>
                    <p><strong>Año:</strong> {watch('year')}</p>
                    <p><strong>Carrera:</strong> {careers.find((c) => c.id === watch('careerId'))?.name}</p>
                    <p>
                      <strong>Autores:</strong>{' '}
                      {selectedAuthorIds
                        .map((id) => students.find((s) => s.id === id))
                        .filter(Boolean)
                        .map((s) => `${s!.firstName} ${s!.lastName}`)
                        .join(', ')}
                    </p>
                    <p>
                      <strong>Tutor:</strong>{' '}
                      {tutors.find((t) => t.id === watch('tutorId'))?.firstName}{' '}
                      {tutors.find((t) => t.id === watch('tutorId'))?.lastName}
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="pt-4 text-right">
                  <Button type="submit" variant="primary" isDisabled={mutation.isPending}>
                    {mutation.isPending ? 'Creando…' : 'Crear Proyecto'}
                  </Button>
                </div>
              )}
            </form>

            {step < 2 && (
              <div className="flex justify-between pt-4">
                <Button variant="ghost" isDisabled={step === 0} onPress={() => setStep((s) => s - 1)}>
                  Anterior
                </Button>
                <Button variant="primary" onPress={handleNext} isDisabled={isAdvancing}>
                  {isAdvancing ? 'Validando…' : 'Siguiente'}
                </Button>
              </div>
            )}

            {mutation.isError && (
              <p className="text-danger text-sm text-center">Error al crear el proyecto. Intente nuevamente.</p>
            )}
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
