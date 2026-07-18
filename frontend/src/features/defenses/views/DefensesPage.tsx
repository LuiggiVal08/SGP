import { useMemo, useState } from 'react';
import {
  Button,
  Input,
  Table,
  Chip,
  Modal,
  Select,
  ListBox,
  Spinner,
  Tooltip,
  useOverlayState,
} from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Gavel, Scale, CalendarPlus, Pencil, CheckCircle2, XCircle } from 'lucide-react';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { projectService } from '@/features/projects/services/project.service';
import { useDefenses, useScheduleDefense, useRescheduleDefense, useRealizeDefense, useCancelDefense } from '../hooks/useDefenses';
import { scheduleDefenseSchema, type ScheduleDefenseFormData } from '../schemas/schedule-defense.schema';
import { defenseStatusConfig, judgeTypeLabels, type DefenseStatus, type JudgeType } from '../types/defense.types';
import { extractApiError } from '@/shared/utils/extractApiError';
import { sileo } from 'sileo';
import type { CatalogUser, CommunityTutor } from '@/shared/types/catalog.types';
import type { Project } from '@/features/projects/types/project.types';

const JUDGE_TYPE_OPTIONS: JudgeType[] = ['SUBJECT_PROFESSOR', 'ACADEMIC_TUTOR', 'COMMUNITY_TUTOR'];

const statusFilterOptions: { value: DefenseStatus | ''; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'PROGRAMADA', label: 'Programada' },
  { value: 'REALIZADA', label: 'Realizada' },
  { value: 'APLAZADA', label: 'Aplazada' },
  { value: 'CANCELADA', label: 'Cancelada' },
];

const PER_PAGE = 10;

function defaultJudges(): ScheduleDefenseFormData['judges'] {
  return JUDGE_TYPE_OPTIONS.map((judgeType) => ({
    judgeType,
    professorId: '',
    communityTutorId: '',
  }));
}

export default function DefensesPage() {
  const [projectFilter, setProjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<DefenseStatus | ''>('');
  const [page, setPage] = useState(1);

  const scheduleModal = useOverlayState();
  const rescheduleModal = useOverlayState();
  const [rescheduling, setRescheduling] = useState<{ id: string; scheduledDate: string } | null>(null);

  const { data: defenses = [], isLoading } = useDefenses();
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: ({ signal }) => projectService.getAll(signal),
    staleTime: 5 * 60 * 1000,
  });
  const { data: professors = [] } = useQuery({
    queryKey: ['users', 'DOCENTE'],
    queryFn: ({ signal }) => catalogService.getUsers('DOCENTE', signal),
    staleTime: 5 * 60 * 1000,
  });
  const { data: communityTutorsPage } = useQuery({
    queryKey: ['community-tutors', 'all'],
    queryFn: ({ signal }) => catalogService.getCommunityTutorsPaginated(1, 1000, undefined, signal),
    staleTime: 5 * 60 * 1000,
  });
  const communityTutors: CommunityTutor[] = communityTutorsPage?.data ?? [];

  const scheduleForm = useForm<ScheduleDefenseFormData>({
    resolver: zodResolver(scheduleDefenseSchema),
    mode: 'onChange',
    defaultValues: { projectId: '', scheduledDate: '', judges: defaultJudges() },
  });
  const { fields: judgeFields } = useFieldArray({ control: scheduleForm.control, name: 'judges' });

  const rescheduleForm = useForm<{ scheduledDate: string; reason: string }>({ defaultValues: { scheduledDate: '', reason: '' } });

  const scheduleMutation = useScheduleDefense();
  const rescheduleMutation = useRescheduleDefense();
  const realizeMutation = useRealizeDefense();
  const cancelMutation = useCancelDefense();

  const projectName = useMemo(() => {
    const map = new Map<string, string>(projects.map((p: Project) => [p.id, p.title]));
    return (id: string) => map.get(id) ?? id;
  }, [projects]);

  const filtered = defenses.filter((d) => {
    if (projectFilter && d.projectId !== projectFilter) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openSchedule = () => {
    scheduleForm.reset({ projectId: '', scheduledDate: '', judges: defaultJudges() });
    scheduleModal.open();
  };

  const openReschedule = (d: { id: string; scheduledDate: string }) => {
    setRescheduling({ id: d.id, scheduledDate: d.scheduledDate });
    rescheduleForm.reset({ scheduledDate: d.scheduledDate.slice(0, 16), reason: '' });
    rescheduleModal.open();
  };

  const submitSchedule = scheduleForm.handleSubmit((values) => {
    scheduleMutation.mutate(
      { ...values, scheduledDate: new Date(values.scheduledDate).toISOString() },
      {
        onSuccess: () => {
          sileo.success({ title: 'Defensa agendada', description: 'La defensa fue programada correctamente.' });
          scheduleModal.close();
        },
        onError: (err: unknown) => {
          sileo.error({ title: extractApiError(err, 'Error al agendar la defensa') });
        },
      },
    );
  });

  const submitReschedule = rescheduleForm.handleSubmit((values) => {
    if (!rescheduling) return;
    rescheduleMutation.mutate(
      { id: rescheduling.id, input: { scheduledDate: new Date(values.scheduledDate).toISOString(), reason: values.reason || undefined } },
      {
        onSuccess: () => {
          sileo.success({ title: 'Defensa reprogramada', description: 'La nueva fecha fue registrada.' });
          rescheduleModal.close();
          setRescheduling(null);
        },
        onError: (err: unknown) => {
          sileo.error({ title: extractApiError(err, 'Error al reprogramar la defensa') });
        },
      },
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Defensas</h2>
        </div>
        <Button variant="primary" onPress={openSchedule}>
          <CalendarPlus size={16} />
          Agendar defensa
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <select
          value={projectFilter}
          onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        >
          <option value="">Todos los proyectos</option>
          {projects.map((p: Project) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value as DefenseStatus | ''); setPage(1); }}
          className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
        >
          {statusFilterOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-muted text-center py-8">Cargando…</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/60 max-h-[70vh]">
            <Table>
              <Table.Content aria-label="Defensas">
                <Table.Header className="sticky top-0 z-10 bg-surface-secondary/95 backdrop-blur-sm [&_th]:text-xs [&_th]:font-semibold [&_th]:text-muted [&_th]:uppercase [&_th]:tracking-wider">
                  <Table.Column id="project" isRowHeader>Proyecto</Table.Column>
                  <Table.Column id="date">Fecha</Table.Column>
                  <Table.Column id="status">Estado</Table.Column>
                  <Table.Column id="judges">Jurados</Table.Column>
                  <Table.Column id="actions" className="w-32">Acciones</Table.Column>
                </Table.Header>
                <Table.Body
                  items={paginated}
                  renderEmptyState={() => (
                    <div className="py-10 text-center text-muted">No hay defensas registradas.</div>
                  )}
                >
                  {(d) => (
                    <Table.Row className="even:bg-surface-secondary/30 hover:bg-primary/[0.06] transition-colors">
                      <Table.Cell>{projectName(d.projectId)}</Table.Cell>
                      <Table.Cell>{new Date(d.scheduledDate).toLocaleString()}</Table.Cell>
                      <Table.Cell>
                        <Chip color={defenseStatusConfig[d.status].color} variant="soft" size="sm">
                          {defenseStatusConfig[d.status].label}
                        </Chip>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col gap-0.5">
                          {d.judges.map((j) => (
                            <span key={j.id} className="text-xs text-muted">
                              {judgeTypeLabels[j.judgeType]}: {j.professor?.firstName ?? j.communityTutor?.fullName ?? '—'}
                            </span>
                          ))}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <Tooltip.Trigger>
                              <button
                                onClick={() => openReschedule(d)}
                                disabled={d.status === 'CANCELADA' || d.status === 'REALIZADA'}
                                className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-40"
                                aria-label="Reprogramar"
                              >
                                <Pencil size={16} />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>Reprogramar</Tooltip.Content>
                          </Tooltip>
                          <Tooltip>
                            <Tooltip.Trigger>
                              <button
                                onClick={() => realizeMutation.mutate(d.id)}
                                disabled={d.status !== 'PROGRAMADA'}
                                className="p-1.5 rounded-lg text-muted hover:text-success hover:bg-success/10 transition-colors disabled:opacity-40"
                                aria-label="Marcar realizada"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>Marcar realizada</Tooltip.Content>
                          </Tooltip>
                          <Tooltip>
                            <Tooltip.Trigger>
                              <button
                                onClick={() => cancelMutation.mutate(d.id)}
                                disabled={d.status === 'CANCELADA' || d.status === 'REALIZADA'}
                                className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
                                aria-label="Cancelar"
                              >
                                <XCircle size={16} />
                              </button>
                            </Tooltip.Trigger>
                            <Tooltip.Content>Cancelar</Tooltip.Content>
                          </Tooltip>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded-lg text-sm ${p === page ? 'bg-primary text-white' : 'border border-border text-muted'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      <Modal.Root state={scheduleModal}>
        <Modal.Backdrop>
          <Modal.Container size="lg">
            <Modal.Dialog className="sm:max-w-[640px] max-h-[85vh] flex flex-col overflow-hidden">
              <Modal.Header className="shrink-0">
                <Modal.Icon className="bg-default text-foreground">
                  <Gavel className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Agendar Defensa</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="p-5 flex-1 overflow-y-auto">
                <form onSubmit={submitSchedule} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium" htmlFor="def-project">Proyecto</label>
                    <Select
                      id="def-project"
                      aria-label="Proyecto"
                      placeholder="Seleccionar proyecto"
                      selectedKey={scheduleForm.watch('projectId') || null}
                      onSelectionChange={(key) => scheduleForm.setValue('projectId', (key as string) ?? '', { shouldValidate: true })}
                    >
                      <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                        <ListBox>
                          {projects.map((p: Project) => (
                            <ListBox.Item key={p.id} id={p.id} textValue={p.title} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                              <ListBox.ItemIndicator />
                              {p.title}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    {scheduleForm.formState.errors.projectId && (
                      <p className="text-danger text-xs">{scheduleForm.formState.errors.projectId.message}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium" htmlFor="def-date">Fecha y hora</label>
                    <Input id="def-date" type="datetime-local" {...scheduleForm.register('scheduledDate')} />
                    {scheduleForm.formState.errors.scheduledDate && (
                      <p className="text-danger text-xs">{scheduleForm.formState.errors.scheduledDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium">Jurados (3 obligatorios: asignatura, académico, comunitario)</p>
                    {judgeFields.map((field, index) => (
                      <div key={field.id} className="rounded-lg border border-border p-3 flex flex-col gap-2">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                          {judgeTypeLabels[scheduleForm.watch(`judges.${index}.judgeType`)]}
                        </span>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted">Profesor</label>
                          <Select
                            aria-label="Profesor"
                            placeholder="Seleccionar profesor"
                            selectedKey={scheduleForm.watch(`judges.${index}.professorId`) || null}
                            onSelectionChange={(key) => scheduleForm.setValue(`judges.${index}.professorId`, (key as string) ?? '', { shouldValidate: true })}
                          >
                            <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                              <ListBox>
                                {professors.map((u: CatalogUser) => (
                                  <ListBox.Item key={u.id} id={u.id} textValue={`${u.firstName} ${u.lastName}`} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                                    <ListBox.ItemIndicator />
                                    {u.firstName} {u.lastName}
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Select.Popover>
                          </Select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs text-muted">Tutor comunitario</label>
                          <Select
                            aria-label="Tutor comunitario"
                            placeholder="Seleccionar tutor comunitario"
                            selectedKey={scheduleForm.watch(`judges.${index}.communityTutorId`) || null}
                            onSelectionChange={(key) => scheduleForm.setValue(`judges.${index}.communityTutorId`, (key as string) ?? '', { shouldValidate: true })}
                          >
                            <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground">
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                              <ListBox>
                                {communityTutors.map((ct: CommunityTutor) => (
                                  <ListBox.Item key={ct.id} id={ct.id} textValue={ct.fullName ?? ''} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                                    <ListBox.ItemIndicator />
                                    {ct.fullName ?? ''}
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Select.Popover>
                          </Select>
                        </div>
                      </div>
                    ))}
                    {scheduleForm.formState.errors.judges && (
                      <p className="text-danger text-xs">
                        {scheduleForm.formState.errors.judges.message ?? 'Revise los jurados asignados'}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button type="submit" variant="primary" isDisabled={!scheduleForm.formState.isValid || scheduleMutation.isPending} className="flex-1">
                      {scheduleMutation.isPending ? <Spinner size="sm" /> : (<><Scale size={16} /> Agendar</>)}
                    </Button>
                    <Button type="button" variant="secondary" onPress={() => scheduleModal.close()} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>

      <Modal.Root state={rescheduleModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[480px] max-h-[85vh] flex flex-col overflow-hidden">
              <Modal.Header className="shrink-0">
                <Modal.Icon className="bg-default text-foreground">
                  <Pencil className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Reprogramar Defensa</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="p-5 flex-1 overflow-y-auto">
                <form onSubmit={submitReschedule} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium" htmlFor="res-date">Nueva fecha y hora</label>
                    <Input id="res-date" type="datetime-local" {...rescheduleForm.register('scheduledDate')} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium" htmlFor="res-reason">Motivo</label>
                    <Input id="res-reason" {...rescheduleForm.register('reason')} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" variant="primary" isDisabled={rescheduleMutation.isPending} className="flex-1">
                      {rescheduleMutation.isPending ? <Spinner size="sm" /> : 'Guardar'}
                    </Button>
                    <Button type="button" variant="secondary" onPress={() => rescheduleModal.close()} className="flex-1">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </div>
  );
}
