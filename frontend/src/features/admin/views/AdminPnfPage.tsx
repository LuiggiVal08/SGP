import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip, Select, ListBox } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Plus, Search, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { FieldLabel } from '@/shared/components/FieldLabel';
import { Pagination } from '@/shared/components/Pagination';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pnfSchema, type PnfFormData } from '../schemas/pnf.schema';
import type { Pnf, Institution } from '@/shared/types/catalog.types';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useInstitutions } from '@/features/catalogs/hooks/useInstitutions';

const PER_PAGE = 10;

export default function AdminPnfPage() {
  usePageTitle('Admin - PNFs');
  const queryClient = useQueryClient();
  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();
  const [editing, setEditing] = useState<Pnf | null>(null);
  const [deleting, setDeleting] = useState<Pnf | null>(null);

  const createForm = useForm<PnfFormData>({
    resolver: zodResolver(pnfSchema),
    mode: 'onChange',
    defaultValues: { name: '', institutionId: '' },
  });

  const editForm = useForm<PnfFormData>({
    resolver: zodResolver(pnfSchema),
    mode: 'onChange',
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['pnf', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getPnfsPaginated(page, PER_PAGE, search || undefined, undefined, signal),
    placeholderData: (prev) => prev,
  });

  const { data: institutions = [] } = useInstitutions();

  const pnfs = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const institutionMap = Object.fromEntries(
    institutions.map((i: Institution) => [i.id, i.name]),
  );

  const createMutation = useMutation({
    mutationFn: () => {
      const { name, institutionId } = createForm.getValues();
      return catalogService.createPnf(name, institutionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pnf'] });
      sileo.success({ title: 'PNF creada exitosamente', description: 'La PNF ya está disponible.' });
      createModal.close();
      createForm.reset();
    },
    onError: () => {
      sileo.error({ title: 'Error al crear la PNF', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => {
      const { name, institutionId } = editForm.getValues();
      return catalogService.updatePnf(id, name, institutionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pnf'] });
      sileo.success({ title: 'PNF actualizada exitosamente', description: 'Los cambios han sido guardados.' });
      editModal.close();
      setEditing(null);
      editForm.reset();
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar la PNF', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deletePnf(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pnf'] });
      sileo.success({ title: 'PNF eliminada exitosamente', description: 'La PNF ha sido removida.' });
      deleteModal.close();
      setDeleting(null);
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar la PNF'), description: 'No se pudo eliminar la PNF.' });
    },
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (c: Pnf) => {
    setEditing(c);
    editForm.reset({ name: c.name, institutionId: c.institutionId });
    editModal.open();
  };

  const openDelete = (c: Pnf) => {
    setDeleting(c);
    deleteModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
            <h2 className="text-2xl font-semibold pl-3">Programas Nacionales de Formación</h2>
          </div>
          <p className="text-sm text-muted mt-0.5">PNFs</p>
        </div>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nueva PNF
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
            <Table.Content aria-label="PNFs">
              <Table.Header className="sticky top-0 z-10 bg-surface-secondary/95 backdrop-blur-sm [&_th]:text-xs [&_th]:font-semibold [&_th]:text-muted [&_th]:uppercase [&_th]:tracking-wider">
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="institution">Institución</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={pnfs}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron PNFs.' : 'No hay PNFs registradas.'} />
                )}
              >
                {(c: Pnf) => (
                  <Table.Row className="even:bg-surface-secondary/30 hover:bg-primary/[0.06] transition-colors">
                    <Table.Cell>{c.name}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{institutionMap[c.institutionId] ?? '—'}</Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <Tooltip.Trigger>
                            <button
                              onClick={() => openEdit(c)}
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
                              onClick={() => openDelete(c)}
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
                  <GraduationCap className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nueva PNF</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="p-5 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <FieldLabel label="Nombre" help="Nombre oficial del Programa Nacional de Formación. Ej: Informática" htmlFor="pnf-name" className="text-sm" />
                    <Input
                      id="pnf-name"
                      {...createForm.register('name')}
                      placeholder="Ej: Ingeniería Informática"
                      autoFocus
                    />
                    {createForm.formState.errors.name && (
                      <p className="text-danger text-xs">{createForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldLabel label="Institución" help="Institución educativa a la que pertenece" htmlFor="pnf-institution" className="text-sm" />
                    <Select
                      id="pnf-institution"
                      aria-label="Institución"
                      placeholder="Seleccionar institución"
                      selectedKey={createForm.watch('institutionId') || null}
                      onSelectionChange={(key) => {
                        createForm.setValue('institutionId', key as string, { shouldValidate: true });
                      }}
                    >
                      <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                        <ListBox>
                          {institutions.map((inst: Institution) => (
                            <ListBox.Item key={inst.id} id={inst.id} textValue={inst.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                              <ListBox.ItemIndicator />
                              {inst.name}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    {createForm.formState.errors.institutionId && (
                      <p className="text-danger text-xs">{createForm.formState.errors.institutionId.message}</p>
                    )}
                  </div>
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
                  <GraduationCap className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar PNF</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="p-5 flex-1 overflow-y-auto">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <FieldLabel label="Nombre" help="Nombre oficial del Programa Nacional de Formación. Ej: Informática" htmlFor="edit-pnf-name" className="text-sm" />
                    <Input
                      id="edit-pnf-name"
                      {...editForm.register('name')}
                      autoFocus
                    />
                    {editForm.formState.errors.name && (
                      <p className="text-danger text-xs">{editForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <FieldLabel label="Institución" help="Institución educativa a la que pertenece" htmlFor="edit-pnf-institution" className="text-sm" />
                    <Select
                      id="edit-pnf-institution"
                      aria-label="Institución"
                      placeholder="Seleccionar institución"
                      selectedKey={editForm.watch('institutionId') || null}
                      onSelectionChange={(key) => {
                        editForm.setValue('institutionId', key as string, { shouldValidate: true });
                      }}
                    >
                      <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                        <ListBox>
                          {institutions.map((inst: Institution) => (
                            <ListBox.Item key={inst.id} id={inst.id} textValue={inst.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                              <ListBox.ItemIndicator />
                              {inst.name}
                            </ListBox.Item>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                    {editForm.formState.errors.institutionId && (
                      <p className="text-danger text-xs">{editForm.formState.errors.institutionId.message}</p>
                    )}
                  </div>
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
                <Modal.Heading>Eliminar PNF</Modal.Heading>
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
