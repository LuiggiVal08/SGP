import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip, Select, ListBox } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { Pagination } from '@/shared/components/Pagination';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectSchema, type SubjectFormData } from '../schemas/subject.schema';
import type { Subject, Trajectory } from '@/shared/types/catalog.types';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useTrajectories } from '@/features/catalogs/hooks/useTrajectories';

const PER_PAGE = 10;

export default function AdminSubjectsPage() {
  usePageTitle('Admin - Asignaturas');
  const queryClient = useQueryClient();
  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);

  const createForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    mode: 'onChange',
    defaultValues: { trajectoryId: '', name: '' },
  });

  const editForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    mode: 'onChange',
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['subjects', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getSubjectsPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });

  const { data: trajectories = [] } = useTrajectories();

  const subjects = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const trajectoryMap = Object.fromEntries(
    trajectories.map((t: Trajectory) => [t.id, t.name]),
  );

  const createMutation = useMutation({
    mutationFn: () => catalogService.createSubject(createForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      sileo.success({ title: 'Asignatura creada exitosamente', description: 'La asignatura ya está disponible.' });
      createModal.close();
      createForm.reset();
    },
    onError: () => {
      sileo.error({ title: 'Error al crear la asignatura', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => catalogService.updateSubject(id, editForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      sileo.success({ title: 'Asignatura actualizada exitosamente', description: 'Los cambios han sido guardados.' });
      editModal.close();
      setEditing(null);
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar la asignatura', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      sileo.success({ title: 'Asignatura eliminada exitosamente', description: 'La asignatura ha sido removida.' });
      deleteModal.close();
      setDeleting(null);
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar la asignatura'), description: 'No se pudo eliminar la asignatura.' });
    },
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (s: Subject) => {
    setEditing(s);
    editForm.reset({ trajectoryId: s.trajectoryId, name: s.name });
    editModal.open();
  };

  const openDelete = (s: Subject) => {
    setDeleting(s);
    deleteModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Asignaturas</h2>
        </div>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nueva Asignatura
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm mb-4">
        <Search size={18} className="text-muted shrink-0" />
        <Input
          placeholder="Buscar por nombre…"
          defaultValue=""
          onChange={(e) => debouncedSetSearch(e.target.value)}
        />
      </div>

      {isError ? (
        <div className="text-center py-12">
          <p className="text-danger mb-2">Error al cargar los datos</p>
          <p className="text-sm text-muted mb-4">Verifique su conexión e intente nuevamente.</p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-3/4 rounded-lg" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border/60 max-h-[70vh]">
          <Table>
            <Table.Content aria-label="Asignaturas">
              <Table.Header className="sticky top-0 z-10 bg-surface-secondary/95 backdrop-blur-sm [&_th]:text-xs [&_th]:font-semibold [&_th]:text-muted [&_th]:uppercase [&_th]:tracking-wider">
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="trajectory">Trayecto</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={subjects}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron asignaturas.' : 'No hay asignaturas registradas.'} />
                )}
              >
                {(s: Subject) => (
                  <Table.Row className="even:bg-surface-secondary/30 hover:bg-primary/[0.06] transition-colors">
                    <Table.Cell>{s.name}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{trajectoryMap[s.trajectoryId] ?? '—'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <Tooltip.Trigger>
                            <button
                              onClick={() => openEdit(s)}
                              className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                              aria-label="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Content>Editar</Tooltip.Content>
                        </Tooltip>
                        <Tooltip>
                          <Tooltip.Trigger>
                            <button
                              onClick={() => openDelete(s)}
                              className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                              aria-label="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Content>Eliminar</Tooltip.Content>
                        </Tooltip>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table>
          </div>
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </>
      )}

      <Modal.Root state={createModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[440px] max-h-[85vh] flex flex-col overflow-hidden">
              <Modal.Header className="shrink-0">
                <Modal.Icon className="bg-default text-foreground">
                  <BookOpen className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nueva Asignatura</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-5 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Nombre" help="Nombre de la unidad curricular. Ej: Programación I" htmlFor="subj-name" className="text-sm" />
                  <Input
                    id="subj-name"
                    {...createForm.register('name')}
                    placeholder="Ej: Programación I"
                    autoFocus
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-danger text-xs">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Trayecto" help="Trayecto al que pertenece la materia" htmlFor="subj-trajectory" className="text-sm" />
                  <Select
                    id="subj-trajectory"
                    aria-label="Trayecto"
                    placeholder="Seleccionar trayecto"
                    selectedKey={createForm.watch('trajectoryId') || null}
                    onSelectionChange={(key) => {
                      createForm.setValue('trajectoryId', key as string, { shouldValidate: true });
                    }}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {trajectories.map((t: Trajectory) => (
                          <ListBox.Item key={t.id} id={t.id} textValue={t.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            <ListBox.ItemIndicator />
                            {t.name}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {createForm.formState.errors.trajectoryId && (
                    <p className="text-danger text-xs">{createForm.formState.errors.trajectoryId.message}</p>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer className="shrink-0">
                <Button className="w-full" variant="secondary" onPress={() => { createModal.close(); createForm.reset(); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!createForm.formState.isValid || createMutation.isPending} onPress={() => createMutation.mutate()}>
                  {createMutation.isPending ? <Spinner size="sm" /> : 'Crear'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>

      <Modal.Root state={editModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[440px] max-h-[85vh] flex flex-col overflow-hidden">
              <Modal.Header className="shrink-0">
                <Modal.Icon className="bg-default text-foreground">
                  <BookOpen className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Asignatura</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-5 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Nombre" help="Nombre de la unidad curricular. Ej: Programación I" htmlFor="edit-subj-name" className="text-sm" />
                  <Input
                    id="edit-subj-name"
                    {...editForm.register('name')}
                    autoFocus
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-danger text-xs">{editForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Trayecto" help="Trayecto al que pertenece la materia" htmlFor="edit-subj-trajectory" className="text-sm" />
                  <Select
                    id="edit-subj-trajectory"
                    aria-label="Trayecto"
                    placeholder="Seleccionar trayecto"
                    selectedKey={editForm.watch('trajectoryId') || null}
                    onSelectionChange={(key) => {
                      editForm.setValue('trajectoryId', key as string, { shouldValidate: true });
                    }}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {trajectories.map((t: Trajectory) => (
                          <ListBox.Item key={t.id} id={t.id} textValue={t.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            <ListBox.ItemIndicator />
                            {t.name}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {editForm.formState.errors.trajectoryId && (
                    <p className="text-danger text-xs">{editForm.formState.errors.trajectoryId.message}</p>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer className="shrink-0">
                <Button className="w-full" variant="secondary" onPress={() => { editModal.close(); setEditing(null); editForm.reset(); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!editForm.formState.isValid || updateMutation.isPending} onPress={() => editing && updateMutation.mutate({ id: editing.id })}>
                  {updateMutation.isPending ? <Spinner size="sm" /> : 'Guardar'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>

      <Modal.Root state={deleteModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[440px] max-h-[85vh] flex flex-col overflow-hidden">
              <Modal.Header className="shrink-0">
                <Modal.Icon className="bg-danger/10 text-danger">
                  <Trash2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Eliminar Asignatura</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="p-5 flex-1 overflow-y-auto">
                <p className="text-sm text-muted">
                  ¿Está seguro de eliminar <strong>{deleting?.name}</strong>? Esta acción no se puede deshacer.
                </p>
              </Modal.Body>
              <Modal.Footer className="shrink-0">
                <Button className="w-full" variant="secondary" onPress={() => { deleteModal.close(); setDeleting(null); }} autoFocus>Cancelar</Button>
                <Button className="w-full" variant="danger" isDisabled={deleteMutation.isPending} onPress={() => deleting && deleteMutation.mutate(deleting.id)}>
                  {deleteMutation.isPending ? <Spinner size="sm" /> : 'Eliminar'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </div>
  );
}
