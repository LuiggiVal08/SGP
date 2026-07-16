import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip, Select, ListBox } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useDebouncedCallback } from 'use-debounce';
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { subjectSchema, type SubjectFormData } from '../schemas/subject.schema';
import { useSubjects, useSubjectMutations } from '@/features/catalogs/hooks/useSubjects';
import { useTrajectories } from '@/features/catalogs/hooks/useTrajectories';
import type { Subject, Trajectory } from '@/shared/types/catalog.types';

const PER_PAGE = 10;

export default function AdminSubjectsPage() {
  usePageTitle('Admin - Materias');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState<Subject | null>(null);

  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();

  const createForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema) as never,
    mode: 'onChange',
    defaultValues: { trajectoryId: '', name: '' },
  });

  const editForm = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema) as never,
    mode: 'onChange',
  });

  const { data: result, isLoading, isError } = useSubjects(page, search);
  const { data: trajectories = [] } = useTrajectories(1, '');
  const { createMutation, updateMutation, deleteMutation } = useSubjectMutations();

  const subjects = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const trajectoryMap = Object.fromEntries(trajectories.map((t: Trajectory) => [t.id, t.name]));

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
          <h2 className="text-2xl font-semibold pl-3">Materias</h2>
        </div>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nueva Materia
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
          <Table>
            <Table.Content aria-label="Materias">
              <Table.Header>
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="trajectory">Trayecto</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={subjects}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron materias.' : 'No hay materias registradas.'} />
                )}
              >
                {(s: Subject) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/80 hover:translate-x-0.5 transition-all duration-150">
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
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </>
      )}

      <Modal.Root state={createModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[360px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <BookOpen className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nueva Materia</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="sub-traj" className="text-sm">Trayecto</label>
                  <Select
                    id="sub-traj"
                    aria-label="Trayecto"
                    placeholder="Seleccionar trayecto"
                    selectedKey={createForm.watch('trajectoryId') || null}
                    onSelectionChange={(key) => createForm.setValue('trajectoryId', key as string, { shouldValidate: true })}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {trajectories.map((t: Trajectory) => (
                          <ListBox.Item key={t.id} id={t.id} textValue={t.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            {t.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {createForm.formState.errors.trajectoryId && (
                    <p className="text-danger text-xs">{createForm.formState.errors.trajectoryId.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="sub-name" className="text-sm">Nombre</label>
                  <Input id="sub-name" {...createForm.register('name')} placeholder="Ej: Programación I" autoFocus />
                  {createForm.formState.errors.name && (
                    <p className="text-danger text-xs">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { createModal.close(); createForm.reset(); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!createForm.formState.isValid || createMutation.isPending} onPress={() => createMutation.mutate(createForm.getValues())}>
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
            <Modal.Dialog className="sm:max-w-[360px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <BookOpen className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Materia</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-sub-traj" className="text-sm">Trayecto</label>
                  <Select
                    id="edit-sub-traj"
                    aria-label="Trayecto"
                    placeholder="Seleccionar trayecto"
                    selectedKey={editForm.watch('trajectoryId') || null}
                    onSelectionChange={(key) => editForm.setValue('trajectoryId', key as string, { shouldValidate: true })}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {trajectories.map((t: Trajectory) => (
                          <ListBox.Item key={t.id} id={t.id} textValue={t.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            {t.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {editForm.formState.errors.trajectoryId && (
                    <p className="text-danger text-xs">{editForm.formState.errors.trajectoryId.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-sub-name" className="text-sm">Nombre</label>
                  <Input id="edit-sub-name" {...editForm.register('name')} autoFocus />
                  {editForm.formState.errors.name && (
                    <p className="text-danger text-xs">{editForm.formState.errors.name.message}</p>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { editModal.close(); setEditing(null); editForm.reset(); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!editForm.formState.isValid || updateMutation.isPending} onPress={() => editing && updateMutation.mutate({ id: editing.id, payload: editForm.getValues() })}>
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
            <Modal.Dialog className="sm:max-w-[360px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-danger/10 text-danger">
                  <Trash2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Eliminar Materia</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-muted">
                  ¿Está seguro de eliminar <strong>{deleting?.name}</strong>? Esta acción no se puede deshacer.
                </p>
              </Modal.Body>
              <Modal.Footer>
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
