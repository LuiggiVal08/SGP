import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip, Select, ListBox } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useDebouncedCallback } from 'use-debounce';
import { Plus, Search, Pencil, Trash2, MapPin } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { communityPlaceSchema, type CommunityPlaceFormData } from '../schemas/communityPlace.schema';
import { useCommunityPlaces, useCommunityPlaceMutations } from '@/features/catalogs/hooks/useCommunityPlaces';
import { useInstitutions } from '@/features/catalogs/hooks/useInstitutions';
import type { CommunityPlace, CommunityPlaceType, Institution } from '@/shared/types/catalog.types';

const PER_PAGE = 10;

const TYPE_LABELS: Record<CommunityPlaceType, string> = {
  COMMUNITY: 'Comunidad',
  ORGANIZATION: 'Organización',
  INSTITUTION: 'Institución',
  COMPANY: 'Empresa',
};

export default function AdminCommunityPlacesPage() {
  usePageTitle('Admin - Espacios Comunitarios');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<CommunityPlace | null>(null);
  const [deleting, setDeleting] = useState<CommunityPlace | null>(null);

  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();

  const createForm = useForm<CommunityPlaceFormData>({
    resolver: zodResolver(communityPlaceSchema) as never,
    mode: 'onChange',
    defaultValues: { institutionId: '', name: '', type: 'COMMUNITY', description: '', address: '', contactPhone: '', contactEmail: '' },
  });

  const editForm = useForm<CommunityPlaceFormData>({
    resolver: zodResolver(communityPlaceSchema) as never,
    mode: 'onChange',
  });

  const { data: result, isLoading, isError } = useCommunityPlaces(page, search);
  const { data: institutions = [] } = useInstitutions();
  const { createMutation, updateMutation, deleteMutation } = useCommunityPlaceMutations();

  const places = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const institutionMap = Object.fromEntries(institutions.map((i: Institution) => [i.id, i.name]));

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (p: CommunityPlace) => {
    setEditing(p);
    editForm.reset({
      institutionId: p.institutionId,
      name: p.name,
      type: p.type,
      description: p.description ?? '',
      address: p.address ?? '',
      contactPhone: p.contactPhone ?? '',
      contactEmail: p.contactEmail ?? '',
    });
    editModal.open();
  };

  const openDelete = (p: CommunityPlace) => {
    setDeleting(p);
    deleteModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Espacios Comunitarios</h2>
        </div>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nuevo Espacio
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
            <Table.Content aria-label="Espacios Comunitarios">
              <Table.Header>
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="institution">Institución</Table.Column>
                <Table.Column id="type">Tipo</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={places}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron espacios.' : 'No hay espacios registrados.'} />
                )}
              >
                {(p: CommunityPlace) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/80 hover:translate-x-0.5 transition-all duration-150">
                    <Table.Cell>{p.name}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{institutionMap[p.institutionId] ?? '—'}</Table.Cell>
                    <Table.Cell className="text-muted text-sm">{TYPE_LABELS[p.type] ?? p.type}</Table.Cell>
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
            <Modal.Dialog className="sm:max-w-[420px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <MapPin className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nuevo Espacio Comunitario</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <label htmlFor="cp-institution" className="text-sm">Institución</label>
                  <Select
                    id="cp-institution"
                    aria-label="Institución"
                    placeholder="Seleccionar institución"
                    selectedKey={createForm.watch('institutionId') || null}
                    onSelectionChange={(key) => createForm.setValue('institutionId', key as string, { shouldValidate: true })}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {institutions.map((i: Institution) => (
                          <ListBox.Item key={i.id} id={i.id} textValue={i.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            {i.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {createForm.formState.errors.institutionId && (
                    <p className="text-danger text-xs">{createForm.formState.errors.institutionId.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="cp-name" className="text-sm">Nombre</label>
                  <Input id="cp-name" {...createForm.register('name')} placeholder="Ej: Consejo Comunal El Carmen" autoFocus />
                  {createForm.formState.errors.name && (
                    <p className="text-danger text-xs">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="cp-type" className="text-sm">Tipo</label>
                  <Select
                    id="cp-type"
                    aria-label="Tipo"
                    selectedKey={createForm.watch('type')}
                    onSelectionChange={(key) => createForm.setValue('type', key as CommunityPlaceType, { shouldValidate: true })}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {(Object.keys(TYPE_LABELS) as CommunityPlaceType[]).map((t) => (
                          <ListBox.Item key={t} id={t} textValue={TYPE_LABELS[t]} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            {TYPE_LABELS[t]}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="cp-desc" className="text-sm">Descripción</label>
                  <Input id="cp-desc" {...createForm.register('description')} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="cp-address" className="text-sm">Dirección</label>
                  <Input id="cp-address" {...createForm.register('address')} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="cp-phone" className="text-sm">Teléfono</label>
                    <Input id="cp-phone" {...createForm.register('contactPhone')} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="cp-email" className="text-sm">Email</label>
                    <Input id="cp-email" {...createForm.register('contactEmail')} />
                    {createForm.formState.errors.contactEmail && (
                      <p className="text-danger text-xs">{createForm.formState.errors.contactEmail.message}</p>
                    )}
                  </div>
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
            <Modal.Dialog className="sm:max-w-[420px] max-h-[85vh] overflow-hidden">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <MapPin className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Espacio Comunitario</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3 overflow-y-auto">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-cp-institution" className="text-sm">Institución</label>
                  <Select
                    id="edit-cp-institution"
                    aria-label="Institución"
                    placeholder="Seleccionar institución"
                    selectedKey={editForm.watch('institutionId') || null}
                    onSelectionChange={(key) => editForm.setValue('institutionId', key as string, { shouldValidate: true })}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {institutions.map((i: Institution) => (
                          <ListBox.Item key={i.id} id={i.id} textValue={i.name} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            {i.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {editForm.formState.errors.institutionId && (
                    <p className="text-danger text-xs">{editForm.formState.errors.institutionId.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-cp-name" className="text-sm">Nombre</label>
                  <Input id="edit-cp-name" {...editForm.register('name')} autoFocus />
                  {editForm.formState.errors.name && (
                    <p className="text-danger text-xs">{editForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-cp-type" className="text-sm">Tipo</label>
                  <Select
                    id="edit-cp-type"
                    aria-label="Tipo"
                    selectedKey={editForm.watch('type')}
                    onSelectionChange={(key) => editForm.setValue('type', key as CommunityPlaceType, { shouldValidate: true })}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {(Object.keys(TYPE_LABELS) as CommunityPlaceType[]).map((t) => (
                          <ListBox.Item key={t} id={t} textValue={TYPE_LABELS[t]} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            {TYPE_LABELS[t]}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-cp-desc" className="text-sm">Descripción</label>
                  <Input id="edit-cp-desc" {...editForm.register('description')} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-cp-address" className="text-sm">Dirección</label>
                  <Input id="edit-cp-address" {...editForm.register('address')} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="edit-cp-phone" className="text-sm">Teléfono</label>
                    <Input id="edit-cp-phone" {...editForm.register('contactPhone')} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="edit-cp-email" className="text-sm">Email</label>
                    <Input id="edit-cp-email" {...editForm.register('contactEmail')} />
                    {editForm.formState.errors.contactEmail && (
                      <p className="text-danger text-xs">{editForm.formState.errors.contactEmail.message}</p>
                    )}
                  </div>
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
                <Modal.Heading>Eliminar Espacio</Modal.Heading>
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
