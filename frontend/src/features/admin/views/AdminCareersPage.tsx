import { useState } from 'react';
import { Button, Input, Table, Modal } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Plus, Search, Pencil, GraduationCap } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { useToastStore } from '@/shared/store/toast.store';
import type { Career } from '@/shared/types/catalog.types';

const PER_PAGE = 10;

export default function AdminCareersPage() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Career | null>(null);
  const [editName, setEditName] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: careers = [], isLoading } = useQuery({
    queryKey: ['careers'],
    queryFn: catalogService.getCareers,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (n: string) => catalogService.createCareer(n),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careers'] });
      addToast('Carrera creada exitosamente', 'success');
      createModal.close();
      setName('');
    },
    onError: () => {
      addToast('Error al crear la carrera', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => catalogService.updateCareer(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careers'] });
      addToast('Carrera actualizada exitosamente', 'success');
      editModal.close();
      setEditing(null);
      setEditName('');
    },
    onError: () => {
      addToast('Error al actualizar la carrera', 'error');
    },
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const filtered = search
    ? careers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : careers;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openEdit = (c: Career) => {
    setEditing(c);
    setEditName(c.name);
    editModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Carreras</h2>
        <Button variant="primary" onPress={createModal.open}>
          <Plus size={16} />
          Nueva Carrera
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

      {isLoading ? (
        <p className="text-muted text-center py-8">Cargando…</p>
      ) : (
        <>
          <Table>
            <Table.Content aria-label="Carreras">
              <Table.Header>
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="actions" className="w-20">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={paginated}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron carreras.' : 'No hay carreras registradas.'} />
                )}
              >
                {(c: Career) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/70 transition-colors">
                    <Table.Cell>{c.name}</Table.Cell>
                    <Table.Cell>
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
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
            <Modal.Dialog className="sm:max-w-[360px]">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <GraduationCap className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nueva Carrera</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <div className="flex flex-col gap-1">
                  <label htmlFor="career-name" className="text-sm">Nombre</label>
                  <Input
                    id="career-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Ingeniería Informática"
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { createModal.close(); setName(''); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!name.trim() || createMutation.isPending} onPress={() => createMutation.mutate(name.trim())}>
                  {createMutation.isPending ? 'Creando…' : 'Crear'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>

      <Modal.Root state={editModal}>
        <Modal.Backdrop>
          <Modal.Container size="sm">
            <Modal.Dialog className="sm:max-w-[360px]">
              <Modal.Header>
                <Modal.Icon className="bg-default text-foreground">
                  <GraduationCap className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Carrera</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-career-name" className="text-sm">Nombre</label>
                  <Input
                    id="edit-career-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { editModal.close(); setEditing(null); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!editName.trim() || updateMutation.isPending} onPress={() => editing && updateMutation.mutate({ id: editing.id, name: editName.trim() })}>
                  {updateMutation.isPending ? 'Guardando…' : 'Guardar'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal.Root>
    </div>
  );
}
