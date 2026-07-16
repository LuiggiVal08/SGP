import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Card, Chip, Button, Skeleton, Modal, Spinner, Select, ListBox,
  Input, NumberField, ComboBox, Switch,
} from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { projectService } from '../services/project.service';
import { FileUploadSection } from '../components/FileUploadSection';
import { Pencil, ArrowLeft, Trash2, GraduationCap, User, Users, Calendar, Building, Plus, FileText, Lock, BookOpen } from 'lucide-react';
import { ProjectFilesSection } from '../components/ProjectFilesSection';
import { usePnf } from '@/features/catalogs/hooks/usePnf';
import { useUsers } from '@/features/catalogs/hooks/useUsers';
import { useTags } from '@/features/catalogs/hooks/useTags';
import { useAuthStore } from '@/shared/store/auth.store';
import { isAdmin } from '@/shared/utils/role';
import type { ProjectStatus, UpdateProjectPayload } from '../types/project.types';
import { PhoneInputField } from '@/shared/components/PhoneInput';
import { sileo } from 'sileo';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { statusConfig } from '@/shared/constants/statusConfig';
import { extractApiError } from '@/shared/utils/extractApiError';

const editSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  year: z.number().int().min(1900).max(2100),
  pnfId: z.string().uuid('Selecciona una PNF'),
  tutorId: z.string().uuid('Selecciona un tutor'),
  authorIds: z.array(z.string().uuid()).min(2, 'Agrega al menos 2 autores').max(5, 'Máximo 5 autores'),
  isExceptional: z.boolean().optional(),
  methodology: z.string().optional(),
});

type EditFormData = z.infer<typeof editSchema>;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const deleteModal = useOverlayState();
  const editModal = useOverlayState();
  const user = useAuthStore((s) => s.user);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: ({ signal }) => projectService.getById(id!, signal),
    enabled: !!id,
    staleTime: 30 * 1000,
  });

  usePageTitle(project ? `Proyecto: ${project.title}` : 'Proyecto');

  const { data: pnfs } = usePnf();
  const { data: students } = useUsers('STUDENT');
  const { data: tutors } = useUsers('DOCENTE');

  const editForm = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    setValue: editSetValue,
    watch: editWatch,
    formState: { errors: editErrors, isValid: editIsValid },
  } = editForm;

  const selectedAuthorIds = editWatch('authorIds') ?? [];
  const isExceptional = editWatch('isExceptional');
  const maxEditAuthors = isExceptional ? 5 : 3;

  const openEdit = () => {
    if (!project) return;
    editForm.reset({
      title: project.title,
      year: project.year,
      pnfId: project.pnfId,
      tutorId: project.tutorId,
      authorIds: [],
      isExceptional: false,
      methodology: project.methodology ?? undefined,
    });
    editModal.open();
  };

  const deleteMutation = useMutation({
    mutationFn: () => projectService.delete(id!),
    onSuccess: () => {
      deleteModal.close();
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      sileo.success({ title: 'Proyecto eliminado exitosamente', description: 'El proyecto ya no está disponible.' });
      setTimeout(() => navigate('/'), 100);
    },
    onError: (err: unknown) => {
      deleteModal.close();
      sileo.error({ title: extractApiError(err, 'Error al eliminar el proyecto'), description: 'No se pudo completar la operación.' });
    },
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: ProjectStatus) => projectService.updateStatus(id!, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      sileo.success({ title: 'Estado actualizado exitosamente', description: 'El proyecto cambió a la nueva etapa.' });
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al actualizar el estado'), description: 'No se pudo actualizar el estado.' });
    },
  });

  const editMutation = useMutation({
    mutationFn: (payload: UpdateProjectPayload) => projectService.update(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      sileo.success({ title: 'Proyecto actualizado exitosamente', description: 'Los cambios han sido guardados.' });
      editModal.close();
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al actualizar el proyecto'), description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const onEdit = (data: EditFormData) => {
    editMutation.mutate(data);
  };

  const ctEditModalState = useOverlayState();
  const ctEditForm = useForm({
    defaultValues: { fullName: '', dni: '', phone: '', email: '', organization: '', position: '', notes: '' },
  });
  const {
    register: ctRegister,
    handleSubmit: ctHandleSubmit,
    setValue: ctSetValue,
    watch: ctWatch,
    reset: ctReset,
  } = ctEditForm;

  const ctEditMutation = useMutation({
    mutationFn: (data: { fullName: string; dni?: string; phone?: string; email?: string; organization?: string; position?: string; notes?: string }) =>
      projectService.updateCommunityTutor(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      sileo.success({ title: 'Tutor comunitario actualizado', description: 'Los datos del tutor comunitario han sido guardados.' });
      ctEditModalState.close();
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al actualizar el tutor comunitario'), description: 'No se pudo completar la operación.' });
    },
  });

  const { data: cartas = [] } = useQuery({
    queryKey: ['project-cartas', id],
    queryFn: ({ signal }) => projectService.getCartas(id!, signal),
    enabled: !!id,
  });

  const cartaMutation = useMutation({
    mutationFn: () => projectService.generateCartas(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-cartas', id] });
      sileo.success({ title: 'Cartas generadas exitosamente', description: 'Las cartas de culminación han sido creadas.' });
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al generar cartas'), description: 'No se pudieron generar las cartas.' });
    },
  });

  const openCtEdit = () => {
    const ct = project?.communityTutor;
    ctReset({
      fullName: ct?.fullName ?? '',
      dni: ct?.dni ?? '',
      phone: ct?.phone ?? '',
      email: ct?.email ?? '',
      organization: ct?.organization ?? '',
      position: ct?.position ?? '',
      notes: ct?.notes ?? '',
    });
    ctEditModalState.open();
  };

  const onCtEdit = (data: { fullName: string; dni?: string; phone?: string; email?: string; organization?: string; position?: string; notes?: string }) => {
    ctEditMutation.mutate(data);
  };

  const toggleEditAuthor = (authorId: string) => {
    const current = selectedAuthorIds;
    if (current.includes(authorId)) {
      editSetValue('authorIds', current.filter((a) => a !== authorId), { shouldValidate: true });
    } else if (current.length < maxEditAuthors) {
      editSetValue('authorIds', [...current, authorId], { shouldValidate: true });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="w-16 h-4 rounded-lg" />
        <Skeleton className="w-full h-40 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-danger mb-2">Error al cargar el proyecto</p>
        <p className="text-sm text-muted mb-4">Verifique su conexión e intente nuevamente.</p>
        <Link to="/" className="text-primary text-sm hover:underline inline-block">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-muted">Proyecto no encontrado</p>
        <Link to="/" className="text-primary text-sm hover:underline mt-2 inline-block">
          Volver al Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-6 space-y-3">
          <div className="flex items-start justify-between">
            <div className="relative">
              <div className="absolute -left-2 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
              <h2 className="text-xl font-bold text-foreground pl-3">{project.title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Chip color={statusConfig[project.status].color} variant="soft" size="sm">
                {statusConfig[project.status].label}
              </Chip>
              {isAdmin(user?.role) && (
                <Select
                  aria-label="Cambiar estado"
                  selectedKey={project.status}
                  onSelectionChange={(key) => statusMutation.mutate(key as ProjectStatus)}
                >
                  <Select.Trigger className="h-8 min-w-0 px-2 border border-border rounded-lg text-xs">
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      {(['PENDING_VALIDATION', 'COMPLETED', 'REJECTED'] as const).map((s) => (
                        <ListBox.Item id={s} key={s} textValue={statusConfig[s].label}>
                          {statusConfig[s].label}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              )}
              <Button
                variant="ghost"
                size="sm"
                onPress={openEdit}
                className="text-muted hover:text-primary hover:bg-primary/10 min-w-0 px-2"
                aria-label="Editar proyecto"
              >
                <Pencil size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                isDisabled={deleteMutation.isPending}
                onPress={deleteModal.open}
                className="text-muted hover:text-danger hover:bg-danger/10 min-w-0 px-2"
                aria-label="Eliminar proyecto"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-foreground">Información del Proyecto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <GraduationCap size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted uppercase tracking-wider">PNF</p>
                <p className="text-sm text-foreground font-medium truncate">
                  {project.pnf?.name ?? 'No asignada'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted uppercase tracking-wider">Tutor</p>
                <p className="text-sm text-foreground font-medium truncate">
                  {project.tutor ? `${project.tutor.firstName} ${project.tutor.lastName}` : 'No asignado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <Calendar size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted uppercase tracking-wider">Año</p>
                <p className="text-sm text-foreground font-medium">{project.year}</p>
              </div>
            </div>
            {project.methodology && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
                <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                  <BookOpen size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted uppercase tracking-wider">Metodología</p>
                  <p className="text-sm text-foreground font-medium">{project.methodology}</p>
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
                  {project.authors && project.authors.length > 0 ? (
                    project.authors.map((author) => (
                      <span
                        key={author.id}
                        className="inline-flex items-center gap-1 text-xs font-medium text-foreground bg-surface-secondary px-2 py-0.5 rounded-full border border-border/50"
                      >
                        {author.firstName} {author.lastName}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted">Sin autores</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building size={16} className="text-secondary" />
              <h3 className="text-base font-semibold text-foreground">Tutor Comunitario</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onPress={openCtEdit}
              className="text-muted hover:text-primary hover:bg-primary/10 min-w-0 px-2"
              aria-label={project.communityTutor ? 'Editar tutor comunitario' : 'Agregar tutor comunitario'}
            >
              {project.communityTutor ? <Pencil size={16} /> : <Plus size={16} />}
            </Button>
          </div>
          {project.communityTutor ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface border border-border sm:col-span-2">
                <p className="text-xs text-muted uppercase tracking-wider">Nombre</p>
                <p className="text-sm text-foreground font-medium">{project.communityTutor.fullName}</p>
              </div>
              {project.communityTutor.dni && (
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider">Cédula de Identidad</p>
                  <p className="text-sm text-foreground font-medium">{project.communityTutor.dni}</p>
                </div>
              )}
              {project.communityTutor.phone && (
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider">Teléfono</p>
                  <p className="text-sm text-foreground font-medium">{project.communityTutor.phone}</p>
                </div>
              )}
              {project.communityTutor.email && (
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider">Correo Electrónico</p>
                  <p className="text-sm text-foreground truncate">{project.communityTutor.email}</p>
                </div>
              )}
              {project.communityTutor.organization && (
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider">Organización</p>
                  <p className="text-sm text-foreground font-medium">{project.communityTutor.organization}</p>
                </div>
              )}
              {project.communityTutor.position && (
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface border border-border">
                  <p className="text-xs text-muted uppercase tracking-wider">Cargo</p>
                  <p className="text-sm text-foreground font-medium">{project.communityTutor.position}</p>
                </div>
              )}
              {project.communityTutor.notes && (
                <div className="flex flex-col gap-1 p-3 rounded-xl bg-surface border border-border sm:col-span-2">
                  <p className="text-xs text-muted uppercase tracking-wider">Notas</p>
                  <p className="text-sm text-muted">{project.communityTutor.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">No se ha registrado un tutor comunitario para este proyecto.</p>
          )}
        </Card.Content>
      </Card.Root>

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Subir Tomos</h3>
          <FileUploadSection projectId={project.id} />
        </Card.Content>
      </Card.Root>

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-6">
          <h3 className="text-base font-semibold text-foreground mb-4">Archivos Subidos</h3>
          <ProjectFilesSection projectId={project.id} />
        </Card.Content>
      </Card.Root>

      <Card.Root variant="secondary" className="border border-border">
        <Card.Content className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-secondary" />
              <h3 className="text-base font-semibold text-foreground">Cartas de Culminación</h3>
            </div>
            <Button
              variant="primary"
              size="sm"
              isDisabled={project.status !== 'COMPLETED' || cartaMutation.isPending}
              onPress={() => cartaMutation.mutate()}
            >
              {project.status !== 'COMPLETED' && <Lock size={14} />}
              {cartaMutation.isPending ? <Spinner size="sm" /> : 'Generar Cartas'}
            </Button>
          </div>
          {project.status !== 'COMPLETED' && (
            <p className="text-xs text-muted flex items-center gap-1">
              <Lock size={12} />
              Debes completar el proyecto antes de generar las cartas de culminación.
            </p>
          )}
          {cartas.length > 0 ? (
            <div className="space-y-2">
              {cartas.map((carta) => {
                const author = project.authors?.find((a) => a.id === carta.userId);
                return (
                  <div key={carta.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-surface/30 p-3">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-primary" />
                      <span className="text-sm font-medium">
                        {author ? `${author.firstName} ${author.lastName}` : 'Autor'}
                      </span>
                    </div>
                    {carta.pdfUrl ? (
                      <a
                        href={carta.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Descargar PDF
                      </a>
                    ) : (
                      <span className="text-xs text-muted">Pendiente</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted">
              {project.status === 'COMPLETED'
                ? 'Presiona "Generar Cartas" para crear las cartas de culminación.'
                : 'Las cartas estarán disponibles cuando el proyecto esté completado.'}
            </p>
          )}
        </Card.Content>
      </Card.Root>
    </div>

    <Modal.Root state={editModal}>
      <Modal.Backdrop>
        <Modal.Container size="lg">
          <Modal.Dialog className="sm:max-w-[540px] max-h-[85vh] overflow-hidden">
            <Modal.Header>
              <Modal.Icon className="bg-primary/10 text-primary">
                <Pencil className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Editar Proyecto</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <form onSubmit={editHandleSubmit(onEdit)} className="flex flex-col min-h-0 flex-1 overflow-hidden">
              <Modal.Body className="space-y-4 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-title" className="text-sm">Título</label>
                  <Input id="edit-title" {...editRegister('title')} />
                  {editErrors.title && <p className="text-danger text-xs">{editErrors.title.message}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-year" className="text-sm">Año</label>
                  <NumberField
                    aria-label="Año del proyecto"
                    value={editWatch('year')}
                    onChange={(val) => editSetValue('year', val, { shouldValidate: true })}
                    minValue={1900}
                    maxValue={2100}
                  />
                  {editErrors.year && <p className="text-danger text-xs">{editErrors.year.message}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-pnf" className="text-sm">PNF</label>
                  <Select
                    aria-label="Seleccionar PNF"
                    selectedKey={editWatch('pnfId') || null}
                    onSelectionChange={(key) => editSetValue('pnfId', key as string, { shouldValidate: true })}
                    placeholder="Seleccionar PNF"
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {(pnfs ?? []).map((c) => (
                          <ListBox.Item key={c.id} id={c.id} textValue={c.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            {c.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {editErrors.pnfId && <p className="text-danger text-xs">{editErrors.pnfId.message}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-methodology" className="text-sm">Metodología</label>
                  <Select
                    aria-label="Seleccionar metodología"
                    selectedKey={editWatch('methodology') || null}
                    onSelectionChange={(key) => editSetValue('methodology', key as string, { shouldValidate: true })}
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
                          <ListBox.Item key={m} id={m} textValue={m} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            {m}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm">Autores (máx. {maxEditAuthors})</label>
                  {isAdmin(user?.role) && (
                    <div className="flex items-center gap-2 my-1">
                      <Switch
                        size="sm"
                        isSelected={isExceptional ?? false}
                        onChange={(val: boolean) => editSetValue('isExceptional', val)}
                      >
                        <span className="text-xs text-muted">Caso excepcional (aprobado por consejo)</span>
                      </Switch>
                    </div>
                  )}
                  {selectedAuthorIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedAuthorIds.map((aid) => {
                        const s = (students ?? []).find((st) => st.id === aid);
                        return s ? (
                          <Chip key={aid} color="success" variant="primary" onClick={() => toggleEditAuthor(aid)} className="cursor-pointer">
                            {s.firstName} {s.lastName}
                          </Chip>
                        ) : null;
                      })}
                    </div>
                  )}
                  {selectedAuthorIds.length >= maxEditAuthors ? (
                    <p className="text-sm text-success">Máximo de autores alcanzado</p>
                  ) : (
                    <ComboBox
                      selectedKey={null}
                      onSelectionChange={(key) => {
                        if (key) toggleEditAuthor(key as string);
                      }}
                    >
                      <ComboBox.InputGroup className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                        <Input placeholder="Buscar estudiante…" />
                        <ComboBox.Trigger />
                      </ComboBox.InputGroup>
                      <ComboBox.Popover className="bg-background border border-border rounded-lg shadow-lg">
                        <ListBox>
                          {(students ?? []).filter((s) => !selectedAuthorIds.includes(s.id)).length === 0 ? (
                            <ListBox.Item id="" className="px-3 py-2 text-sm text-muted" isDisabled>
                              No hay estudiantes disponibles
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ) : (
                            (students ?? [])
                              .filter((s) => !selectedAuthorIds.includes(s.id))
                              .map((s) => (
                                <ListBox.Item key={s.id} id={s.id} textValue={`${s.firstName} ${s.lastName}`} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                                  {s.firstName} {s.lastName}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))
                          )}
                        </ListBox>
                      </ComboBox.Popover>
                    </ComboBox>
                  )}
                  {editErrors.authorIds && <p className="text-danger text-xs">{editErrors.authorIds.message}</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-tutor" className="text-sm">Tutor</label>
                  <ComboBox
                    selectedKey={editWatch('tutorId') || null}
                    onSelectionChange={(key) => editSetValue('tutorId', key as string, { shouldValidate: true })}
                  >
                    <ComboBox.InputGroup className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Input placeholder="Buscar tutor…" />
                      <ComboBox.Trigger />
                    </ComboBox.InputGroup>
                    <ComboBox.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {(tutors ?? []).length === 0 ? (
                          <ListBox.Item id="" className="px-3 py-2 text-sm text-muted" isDisabled>
                            No hay tutores disponibles
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ) : (
                          (tutors ?? []).map((t) => (
                            <ListBox.Item key={t.id} id={t.id} textValue={`${t.firstName} ${t.lastName}`} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                              {t.firstName} {t.lastName}
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          ))
                        )}
                      </ListBox>
                    </ComboBox.Popover>
                  </ComboBox>
                  {editErrors.tutorId && <p className="text-danger text-xs">{editErrors.tutorId.message}</p>}
                </div>

              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={editModal.close} autoFocus>
                  Cancelar
                </Button>
                <Button
                  className="w-full"
                  variant="primary"
                  type="submit"
                  isDisabled={!editIsValid || editMutation.isPending}
                >
                  {editMutation.isPending ? <Spinner size="sm" /> : 'Guardar Cambios'}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>

    <Modal.Root state={ctEditModalState}>
      <Modal.Backdrop>
        <Modal.Container size="sm">
          <Modal.Dialog className="sm:max-w-[480px] max-h-[85vh] overflow-hidden">
            <Modal.Header>
              <Modal.Icon className="bg-secondary/10 text-secondary">
                <Building className="size-5" />
              </Modal.Icon>
              <Modal.Heading>
                {project?.communityTutor ? 'Editar Tutor Comunitario' : 'Agregar Tutor Comunitario'}
              </Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <form onSubmit={ctHandleSubmit(onCtEdit)} className="flex flex-col min-h-0 flex-1 overflow-hidden">
              <Modal.Body className="space-y-4 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-edit-name" className="text-sm">Nombre completo</label>
                  <Input id="ct-edit-name" {...ctRegister('fullName')} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="ct-edit-dni" className="text-sm">Cédula de identidad</label>
                    <Input id="ct-edit-dni" {...ctRegister('dni')} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="ct-edit-phone" className="text-sm">Teléfono</label>
                    <PhoneInputField
                      value={ctWatch('phone')}
                      onChange={(val) => ctSetValue('phone', val ?? '')}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-edit-email" className="text-sm">Correo electrónico</label>
                  <Input id="ct-edit-email" {...ctRegister('email')} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="ct-edit-org" className="text-sm">Organización</label>
                    <Input id="ct-edit-org" {...ctRegister('organization')} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="ct-edit-position" className="text-sm">Cargo</label>
                    <Input id="ct-edit-position" {...ctRegister('position')} />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="ct-edit-notes" className="text-sm">Notas</label>
                  <Input id="ct-edit-notes" {...ctRegister('notes')} />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={ctEditModalState.close} autoFocus>
                  Cancelar
                </Button>
                <Button
                  className="w-full"
                  variant="primary"
                  type="submit"
                  isDisabled={ctEditMutation.isPending}
                >
                  {ctEditMutation.isPending ? <Spinner size="sm" /> : 'Guardar'}
                </Button>
              </Modal.Footer>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>

    <Modal.Root state={deleteModal}>
      <Modal.Backdrop>
        <Modal.Container size="sm">
          <Modal.Dialog className="sm:max-w-[360px] max-h-[85vh] overflow-hidden">
            <Modal.Header>
              <Modal.Icon className="bg-danger/10 text-danger">
                <Trash2 className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Eliminar Proyecto</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-muted">
                ¿Está seguro de eliminar <strong>{project?.title}</strong>? Esta acción no se puede deshacer.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button className="w-full" variant="secondary" onPress={deleteModal.close} autoFocus>Cancelar</Button>
              <Button className="w-full" variant="danger" isDisabled={deleteMutation.isPending} onPress={() => deleteMutation.mutate()}>
                {deleteMutation.isPending ? <Spinner size="sm" /> : 'Eliminar'}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>
    </>
  );
}
