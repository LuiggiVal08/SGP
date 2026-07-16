import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useDebouncedCallback } from 'use-debounce';
import { Plus, Search, Pencil, Trash2, CalendarRange } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { periodSchema, type PeriodFormData } from '../schemas/period.schema';
import { usePeriods, usePeriodMutations } from '@/features/catalogs/hooks/usePeriods';
import type { Period } from '@/shared/types/catalog.types';

const PER_PAGE = 10;

export default function AdminPeriodsPage() {
  usePageTitle('Admin - Periodos');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Period | null>(null);
  const [deleting, setDeleting] = useState<Period | null>(null);

  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();

  const createForm = useForm<PeriodFormData>({
    resolver: zodResolver(periodSchema) as never,
    mode: 'onChange',
    defaultValues: { name: '', startDate: '', endDate: '', isActive: true },
  });

  const editForm = useForm<PeriodFormData>({
    resolver: zodResolver(periodSchema) as never,
    mode: 'onChange',
  });

  const { data: result, isLoading, isError } = usePeriods(page, search);
  const { createMutation, updateMutation, deleteMutation } = usePeriodMutations();

  const periods = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (p: Period) => {
    setEditing(p);
    editForm.reset({
      name: p.name,
      startDate: p.startDate ? p.startDate.slice(0, 10) : '',
      endDate: p.endDate ? p.endDate.slice(0, 10) : '',
      isActive: p.isActive,
    });
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
          <Table>
            <Table.Content aria-label="Periodos">
              <Table.Header>
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="startDate">Inicio</Table.Column>
                <Table.Column id="endDate">Fin</Table.Column>
                <Table.Column id="isActive">Activo</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={periods}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron periodos.' : 'No hay periodos registrados.'} />
                )}
              >
                {(p: Period) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/80 hover:translate-x-0.5 transition-all duration-150">
                    <Table.Cell>{p.name}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{p.startDate ? p.startDate.slice(0, 10) : '—'}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{p.endDate ? p.endDate.slice(0, 10) : '—'}</Table.Cell>
                    <Table.Cell>
                      {p.isActive ? (
                        <span className="text-success text-xs font-medium">Activo</span>
                      ) : (
                        <span className="text-muted text-xs">Inactivo</span>
                      )}
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
          <Pagination current={page} total={totalPages} onChange={setPage} />
        </>
      )}

      <Modal.Root state={createModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[360px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <CalendarRange className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nuevo Periodo</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="period-name" className="text-sm">Nombre</label>
                  <Input id="period-name" {...createForm.register('name')} placeholder="Ej: 2026-I" autoFocus />
                  {createForm.formState.errors.name && (
                    <p className="text-danger text-xs">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="period-start" className="text-sm">Fecha de inicio</label>
                  <Input id="period-start" type="date" {...createForm.register('startDate')} />
                  {createForm.formState.errors.startDate && (
                    <p className="text-danger text-xs">{createForm.formState.errors.startDate.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="period-end" className="text-sm">Fecha de fin</label>
                  <Input id="period-end" type="date" {...createForm.register('endDate')} />
                  {createForm.formState.errors.endDate && (
                    <p className="text-danger text-xs">{createForm.formState.errors.endDate.message}</p>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...createForm.register('isActive')} className="accent-primary" />
                  Periodo activo
                </label>
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
                  <CalendarRange className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Periodo</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-period-name" className="text-sm">Nombre</label>
                  <Input id="edit-period-name" {...editForm.register('name')} autoFocus />
                  {editForm.formState.errors.name && (
                    <p className="text-danger text-xs">{editForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-period-start" className="text-sm">Fecha de inicio</label>
                  <Input id="edit-period-start" type="date" {...editForm.register('startDate')} />
                  {editForm.formState.errors.startDate && (
                    <p className="text-danger text-xs">{editForm.formState.errors.startDate.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-period-end" className="text-sm">Fecha de fin</label>
                  <Input id="edit-period-end" type="date" {...editForm.register('endDate')} />
                  {editForm.formState.errors.endDate && (
                    <p className="text-danger text-xs">{editForm.formState.errors.endDate.message}</p>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" {...editForm.register('isActive')} className="accent-primary" />
                  Periodo activo
                </label>
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
                <Modal.Heading>Eliminar Periodo</Modal.Heading>
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
