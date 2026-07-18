import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Plus, Search, Pencil, Trash2, Calendar } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { Pagination } from '@/shared/components/Pagination';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { periodSchema, type PeriodFormData } from '../schemas/period.schema';
import type { Period } from '@/shared/types/catalog.types';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

const PER_PAGE = 10;

export default function AdminPeriodsPage() {
  usePageTitle('Admin - Periodos');
  const queryClient = useQueryClient();
  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();
  const [editing, setEditing] = useState<Period | null>(null);
  const [deleting, setDeleting] = useState<Period | null>(null);

  const createForm = useForm<PeriodFormData>({
    resolver: zodResolver(periodSchema),
    mode: 'onChange',
    defaultValues: { name: '', startDate: '', endDate: '', isActive: false },
  });

  const editForm = useForm<PeriodFormData>({
    resolver: zodResolver(periodSchema),
    mode: 'onChange',
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['periods', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getPeriodsPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });

  const periods = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const createMutation = useMutation({
    mutationFn: () => catalogService.createPeriod(createForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      sileo.success({ title: 'Periodo creado exitosamente', description: 'El periodo ya está disponible.' });
      createModal.close();
      createForm.reset();
    },
    onError: () => {
      sileo.error({ title: 'Error al crear el periodo', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => catalogService.updatePeriod(id, editForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      sileo.success({ title: 'Periodo actualizado exitosamente', description: 'Los cambios han sido guardados.' });
      editModal.close();
      setEditing(null);
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar el periodo', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deletePeriod(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['periods'] });
      sileo.success({ title: 'Periodo eliminado exitosamente', description: 'El periodo ha sido removido.' });
      deleteModal.close();
      setDeleting(null);
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar el periodo'), description: 'No se pudo eliminar el periodo.' });
    },
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (p: Period) => {
    setEditing(p);
    editForm.reset({ name: p.name, startDate: p.startDate?.split('T')[0] ?? '', endDate: p.endDate?.split('T')[0] ?? '', isActive: p.isActive });
    editModal.open();
  };

  const openDelete = (p: Period) => {
    setDeleting(p);
    deleteModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Periodos</h2>
        </div>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nuevo Periodo
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
            <Table.Content aria-label="Periodos">
              <Table.Header className="sticky top-0 z-10 bg-surface-secondary/95 backdrop-blur-sm [&_th]:text-xs [&_th]:font-semibold [&_th]:text-muted [&_th]:uppercase [&_th]:tracking-wider">
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="startDate">Inicio</Table.Column>
                <Table.Column id="endDate">Fin</Table.Column>
                <Table.Column id="isActive">Estado</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={periods}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron periodos.' : 'No hay periodos registrados.'} />
                )}
              >
                {(p: Period) => (
                  <Table.Row className="even:bg-surface-secondary/30 hover:bg-primary/[0.06] transition-colors">
                    <Table.Cell>{p.name}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{p.startDate?.split('T')[0]}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{p.endDate?.split('T')[0]}</Table.Cell>
                    <Table.Cell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-success/10 text-success' : 'bg-default text-muted'}`}>
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <Tooltip.Trigger>
                            <button
                              onClick={() => openEdit(p)}
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
                              onClick={() => openDelete(p)}
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
                  <Calendar className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nuevo Periodo</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-5 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Nombre" help="Nombre del periodo académico. Ej: 2024-I" htmlFor="period-name" className="text-sm" />
                  <Input
                    id="period-name"
                    {...createForm.register('name')}
                    placeholder="Ej: 2024-I"
                    autoFocus
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-danger text-xs">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Fecha de inicio" help="Fecha en formato día/mes/año" htmlFor="period-start" className="text-sm" />
                  <Input
                    id="period-start"
                    type="date"
                    {...createForm.register('startDate')}
                  />
                  {createForm.formState.errors.startDate && (
                    <p className="text-danger text-xs">{createForm.formState.errors.startDate.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Fecha de fin" help="Fecha en formato día/mes/año" htmlFor="period-end" className="text-sm" />
                  <Input
                    id="period-end"
                    type="date"
                    {...createForm.register('endDate')}
                  />
                  {createForm.formState.errors.endDate && (
                    <p className="text-danger text-xs">{createForm.formState.errors.endDate.message}</p>
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
                  <Calendar className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Periodo</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-5 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Nombre" help="Nombre del periodo académico. Ej: 2024-I" htmlFor="edit-period-name" className="text-sm" />
                  <Input
                    id="edit-period-name"
                    {...editForm.register('name')}
                    autoFocus
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-danger text-xs">{editForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Fecha de inicio" help="Fecha en formato día/mes/año" htmlFor="edit-period-start" className="text-sm" />
                  <Input
                    id="edit-period-start"
                    type="date"
                    {...editForm.register('startDate')}
                  />
                  {editForm.formState.errors.startDate && (
                    <p className="text-danger text-xs">{editForm.formState.errors.startDate.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <FieldLabel label="Fecha de fin" help="Fecha en formato día/mes/año" htmlFor="edit-period-end" className="text-sm" />
                  <Input
                    id="edit-period-end"
                    type="date"
                    {...editForm.register('endDate')}
                  />
                  {editForm.formState.errors.endDate && (
                    <p className="text-danger text-xs">{editForm.formState.errors.endDate.message}</p>
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
                <Modal.Heading>Eliminar Periodo</Modal.Heading>
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
