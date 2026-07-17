import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Plus, Search, Pencil, Trash2, Building2 } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { institutionSchema, type InstitutionFormData } from '../schemas/institution.schema';
import type { Institution } from '@/shared/types/catalog.types';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

const PER_PAGE = 10;

export default function AdminInstitutionsPage() {
  usePageTitle('Admin - Instituciones');
  const queryClient = useQueryClient();
  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();
  const [editing, setEditing] = useState<Institution | null>(null);
  const [deleting, setDeleting] = useState<Institution | null>(null);

  const createForm = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    mode: 'onChange',
    defaultValues: { name: '', acronym: '', email: '', contactInfo: '' },
  });

  const editForm = useForm<InstitutionFormData>({
    resolver: zodResolver(institutionSchema),
    mode: 'onChange',
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['institutions', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getInstitutionsPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });

  const institutions = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const createMutation = useMutation({
    mutationFn: () => catalogService.createInstitution(createForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      sileo.success({ title: 'Institución creada exitosamente', description: 'La institución ya está disponible.' });
      createModal.close();
      createForm.reset();
    },
    onError: () => {
      sileo.error({ title: 'Error al crear la institución', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => catalogService.updateInstitution(id, editForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      sileo.success({ title: 'Institución actualizada exitosamente', description: 'Los cambios han sido guardados.' });
      editModal.close();
      setEditing(null);
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar la institución', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteInstitution(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      sileo.success({ title: 'Institución eliminada exitosamente', description: 'La institución ha sido removida.' });
      deleteModal.close();
      setDeleting(null);
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar la institución'), description: 'No se pudo eliminar la institución.' });
    },
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (inst: Institution) => {
    setEditing(inst);
    editForm.reset({ name: inst.name, acronym: inst.acronym ?? '', email: inst.email ?? '', contactInfo: inst.contactInfo ?? '' });
    editModal.open();
  };

  const openDelete = (inst: Institution) => {
    setDeleting(inst);
    deleteModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Instituciones</h2>
        </div>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nueva Institución
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm mb-4">
        <Search size={18} className="text-muted shrink-0" />
        <Input
          placeholder="Buscar por nombre o siglas…"
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
            <Table.Content aria-label="Instituciones">
              <Table.Header>
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="acronym">Siglas</Table.Column>
                <Table.Column id="email">Email</Table.Column>
                <Table.Column id="contactInfo">Contacto</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={institutions}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron instituciones.' : 'No hay instituciones registradas.'} />
                )}
              >
                {(i: Institution) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/80 hover:translate-x-0.5 transition-all duration-150">
                    <Table.Cell>{i.name}</Table.Cell>
                    <Table.Cell>{i.acronym}</Table.Cell>
                    <Table.Cell>{i.email}</Table.Cell>
                    <Table.Cell>{i.contactInfo}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <Tooltip.Trigger>
                            <button
                              onClick={() => openEdit(i)}
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
                              onClick={() => openDelete(i)}
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
                  <Building2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nueva Institución</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="inst-name" className="text-sm">Nombre</label>
                  <Input
                    id="inst-name"
                    {...createForm.register('name')}
                    placeholder="Ej: Universidad Nacional"
                    autoFocus
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-danger text-xs">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="inst-acronym" className="text-sm">Siglas</label>
                  <Input
                    id="inst-acronym"
                    {...createForm.register('acronym')}
                    placeholder="Ej: UNA"
                  />
                  {createForm.formState.errors.acronym && (
                    <p className="text-danger text-xs">{createForm.formState.errors.acronym.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="inst-email" className="text-sm">Email</label>
                  <Input
                    id="inst-email"
                    {...createForm.register('email')}
                    placeholder="Ej: contacto@una.py"
                  />
                  {createForm.formState.errors.email && (
                    <p className="text-danger text-xs">{createForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="inst-contact" className="text-sm">Contacto</label>
                  <Input
                    id="inst-contact"
                    {...createForm.register('contactInfo')}
                    placeholder="Ej: San Lorenzo, Paraguay"
                  />
                  {createForm.formState.errors.contactInfo && (
                    <p className="text-danger text-xs">{createForm.formState.errors.contactInfo.message}</p>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer>
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
            <Modal.Dialog className="sm:max-w-[360px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <Building2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Institución</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-inst-name" className="text-sm">Nombre</label>
                  <Input
                    id="edit-inst-name"
                    {...editForm.register('name')}
                    autoFocus
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-danger text-xs">{editForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-inst-acronym" className="text-sm">Siglas</label>
                  <Input
                    id="edit-inst-acronym"
                    {...editForm.register('acronym')}
                  />
                  {editForm.formState.errors.acronym && (
                    <p className="text-danger text-xs">{editForm.formState.errors.acronym.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-inst-email" className="text-sm">Email</label>
                  <Input
                    id="edit-inst-email"
                    {...editForm.register('email')}
                  />
                  {editForm.formState.errors.email && (
                    <p className="text-danger text-xs">{editForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-inst-contact" className="text-sm">Contacto</label>
                  <Input
                    id="edit-inst-contact"
                    {...editForm.register('contactInfo')}
                  />
                  {editForm.formState.errors.contactInfo && (
                    <p className="text-danger text-xs">{editForm.formState.errors.contactInfo.message}</p>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer>
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
            <Modal.Dialog className="sm:max-w-[360px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-danger/10 text-danger">
                  <Trash2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Eliminar Institución</Modal.Heading>
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
