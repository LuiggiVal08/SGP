import { useState } from 'react';
import { Button, Input, Table, Modal, Skeleton, Spinner, Tooltip, Select, ListBox } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Plus, Search, Pencil, Trash2, Tag } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { sileo } from 'sileo';
import { extractApiError } from '@/shared/utils/extractApiError';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tagSchema, type TagFormData } from '../schemas/tag.schema';
import type { Tag as TagType } from '@/shared/types/catalog.types';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

const PER_PAGE = 10;
const TAG_CATEGORIES = ['TECNOLOGIA', 'TEMA', 'TUTOR', 'METODOLOGIA'] as const;

export default function AdminTagsPage() {
  usePageTitle('Admin - Etiquetas');
  const queryClient = useQueryClient();
  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const deleteModal = useOverlayState();
  const [editing, setEditing] = useState<TagType | null>(null);
  const [deleting, setDeleting] = useState<TagType | null>(null);

  const createForm = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    mode: 'onChange',
    defaultValues: { name: '', category: 'TECNOLOGIA' },
  });

  const editForm = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    mode: 'onChange',
  });

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: result, isLoading, isError } = useQuery({
    queryKey: ['tags', 'paginated', page, search],
    queryFn: ({ signal }) => catalogService.getTagsPaginated(page, PER_PAGE, search || undefined, signal),
    placeholderData: (prev) => prev,
  });

  const tags = result?.data ?? [];
  const totalPages = result?.meta?.totalPages ?? 1;

  const categoryColor: Record<string, string> = {
    TECNOLOGIA: 'bg-primary/10 text-primary',
    TEMA: 'bg-success/10 text-success',
    TUTOR: 'bg-warning/10 text-warning',
    METODOLOGIA: 'bg-danger/10 text-danger',
  };

  const createMutation = useMutation({
    mutationFn: () => catalogService.createTag(createForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      sileo.success({ title: 'Etiqueta creada exitosamente', description: 'La etiqueta ya está disponible.' });
      createModal.close();
      createForm.reset();
    },
    onError: () => {
      sileo.error({ title: 'Error al crear la etiqueta', description: 'Verifique los datos e intente nuevamente.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => catalogService.updateTag(id, editForm.getValues()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      sileo.success({ title: 'Etiqueta actualizada exitosamente', description: 'Los cambios han sido guardados.' });
      editModal.close();
      setEditing(null);
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar la etiqueta', description: 'Ocurrió un problema al guardar.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => catalogService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      sileo.success({ title: 'Etiqueta eliminada exitosamente', description: 'La etiqueta ha sido removida.' });
      deleteModal.close();
      setDeleting(null);
    },
    onError: (err: unknown) => {
      sileo.error({ title: extractApiError(err, 'Error al eliminar la etiqueta'), description: 'No se pudo eliminar la etiqueta.' });
    },
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const openEdit = (t: TagType) => {
    setEditing(t);
    editForm.reset({ name: t.name, category: t.category as TagFormData['category'] });
    editModal.open();
  };

  const openDelete = (t: TagType) => {
    setDeleting(t);
    deleteModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h2 className="text-2xl font-semibold pl-3">Etiquetas</h2>
        </div>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nueva Etiqueta
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
            <Table.Content aria-label="Etiquetas">
              <Table.Header>
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="category">Categoría</Table.Column>
                <Table.Column id="actions" className="w-28">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={tags}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron etiquetas.' : 'No hay etiquetas registradas.'} />
                )}
              >
                {(t: TagType) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/80 hover:translate-x-0.5 transition-all duration-150">
                    <Table.Cell>{t.name}</Table.Cell>
                    <Table.Cell>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor[t.category] ?? 'bg-default text-muted'}`}>
                        {t.category}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <Tooltip.Trigger>
                            <button
                              onClick={() => openEdit(t)}
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
                              onClick={() => openDelete(t)}
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
                  <Tag className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nueva Etiqueta</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="tag-name" className="text-sm">Nombre</label>
                  <Input
                    id="tag-name"
                    {...createForm.register('name')}
                    placeholder="Ej: Inteligencia Artificial"
                    autoFocus
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-danger text-xs">{createForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="tag-category" className="text-sm">Categoría</label>
                  <Select
                    id="tag-category"
                    aria-label="Categoría"
                    placeholder="Seleccionar categoría"
                    selectedKey={createForm.watch('category') || null}
                    onSelectionChange={(key) => {
                      createForm.setValue('category', key as TagFormData['category'], { shouldValidate: true });
                    }}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {TAG_CATEGORIES.map((cat) => (
                          <ListBox.Item key={cat} id={cat} textValue={cat} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            <ListBox.ItemIndicator />
                            {cat}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {createForm.formState.errors.category && (
                    <p className="text-danger text-xs">{createForm.formState.errors.category.message}</p>
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
                  <Tag className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Etiqueta</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3 p-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-tag-name" className="text-sm">Nombre</label>
                  <Input
                    id="edit-tag-name"
                    {...editForm.register('name')}
                    autoFocus
                  />
                  {editForm.formState.errors.name && (
                    <p className="text-danger text-xs">{editForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-tag-category" className="text-sm">Categoría</label>
                  <Select
                    id="edit-tag-category"
                    aria-label="Categoría"
                    placeholder="Seleccionar categoría"
                    selectedKey={editForm.watch('category') || null}
                    onSelectionChange={(key) => {
                      editForm.setValue('category', key as TagFormData['category'], { shouldValidate: true });
                    }}
                  >
                    <Select.Trigger className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground data-[pressed]:ring-2 data-[pressed]:ring-primary/40">
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="bg-background border border-border rounded-lg shadow-lg">
                      <ListBox>
                        {TAG_CATEGORIES.map((cat) => (
                          <ListBox.Item key={cat} id={cat} textValue={cat} className="px-3 py-2 text-sm hover:bg-surface-secondary cursor-pointer data-[selected]:bg-primary/10 data-[selected]:text-primary">
                            <ListBox.ItemIndicator />
                            {cat}
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                  {editForm.formState.errors.category && (
                    <p className="text-danger text-xs">{editForm.formState.errors.category.message}</p>
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
                <Modal.Heading>Eliminar Etiqueta</Modal.Heading>
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
