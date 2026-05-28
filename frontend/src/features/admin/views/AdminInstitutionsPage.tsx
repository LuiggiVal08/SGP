import { useState } from 'react';
import { Button, Input, Table, Modal } from '@heroui/react';
import { useOverlayState } from '@heroui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { Plus, Search, Pencil, Building2 } from 'lucide-react';
import { EmptyState } from '@/shared/components/EmptyState';
import { Pagination } from '@/shared/components/Pagination';
import { useToastStore } from '@/shared/store/toast.store';
import type { Institution } from '@/shared/types/catalog.types';

const PER_PAGE = 10;

export default function AdminInstitutionsPage() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const createModal = useOverlayState();
  const editModal = useOverlayState();
  const [form, setForm] = useState({ name: '', acronym: '', email: '', contactInfo: '' });
  const [editing, setEditing] = useState<Institution | null>(null);
  const [editForm, setEditForm] = useState({ name: '', acronym: '', email: '', contactInfo: '' });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: institutions = [], isLoading } = useQuery({
    queryKey: ['institutions'],
    queryFn: catalogService.getInstitutions,
    staleTime: 5 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: () => catalogService.createInstitution(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      addToast('Institución creada exitosamente', 'success');
      createModal.close();
      setForm({ name: '', acronym: '', email: '', contactInfo: '' });
    },
    onError: () => {
      addToast('Error al crear la institución', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof editForm }) => catalogService.updateInstitution(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institutions'] });
      addToast('Institución actualizada exitosamente', 'success');
      editModal.close();
      setEditing(null);
    },
    onError: () => {
      addToast('Error al actualizar la institución', 'error');
    },
  });

  const debouncedSetSearch = useDebouncedCallback((val: string) => {
    setSearch(val);
    setPage(1);
  }, 300);

  const filtered = search
    ? institutions.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.acronym.toLowerCase().includes(search.toLowerCase()),
      )
    : institutions;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const openEdit = (inst: Institution) => {
    setEditing(inst);
    setEditForm({ name: inst.name, acronym: inst.acronym, email: inst.email, contactInfo: inst.contactInfo });
    editModal.open();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Instituciones</h2>
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

      {isLoading ? (
        <p className="text-muted text-center py-8">Cargando…</p>
      ) : (
        <>
          <Table>
            <Table.Content aria-label="Instituciones">
              <Table.Header>
                <Table.Column id="name" isRowHeader>Nombre</Table.Column>
                <Table.Column id="acronym">Siglas</Table.Column>
                <Table.Column id="email">Email</Table.Column>
                <Table.Column id="contactInfo">Contacto</Table.Column>
                <Table.Column id="actions" className="w-20">Acciones</Table.Column>
              </Table.Header>
              <Table.Body
                items={paginated}
                renderEmptyState={() => (
                  <EmptyState message={search ? 'No se encontraron instituciones.' : 'No hay instituciones registradas.'} />
                )}
              >
                {(i: Institution) => (
                  <Table.Row className="even:bg-surface-secondary/40 hover:bg-surface-secondary/70 transition-colors">
                    <Table.Cell>{i.name}</Table.Cell>
                    <Table.Cell>{i.acronym}</Table.Cell>
                    <Table.Cell>{i.email}</Table.Cell>
                    <Table.Cell>{i.contactInfo}</Table.Cell>
                    <Table.Cell>
                      <button
                        onClick={() => openEdit(i)}
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
                  <Building2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Nueva Institución</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="inst-name" className="text-sm">Nombre</label>
                  <Input id="inst-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Universidad Nacional" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="inst-acronym" className="text-sm">Siglas</label>
                  <Input id="inst-acronym" value={form.acronym} onChange={(e) => setForm((f) => ({ ...f, acronym: e.target.value }))} placeholder="Ej: UNA" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="inst-email" className="text-sm">Email</label>
                  <Input id="inst-email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="Ej: contacto@una.py" />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="inst-contact" className="text-sm">Contacto</label>
                  <Input id="inst-contact" value={form.contactInfo} onChange={(e) => setForm((f) => ({ ...f, contactInfo: e.target.value }))} placeholder="Ej: San Lorenzo, Paraguay" />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { createModal.close(); setForm({ name: '', acronym: '', email: '', contactInfo: '' }); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!form.name.trim() || createMutation.isPending} onPress={() => createMutation.mutate()}>
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
                  <Building2 className="size-5" />
                </Modal.Icon>
                <Modal.Heading>Editar Institución</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-inst-name" className="text-sm">Nombre</label>
                  <Input id="edit-inst-name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-inst-acronym" className="text-sm">Siglas</label>
                  <Input id="edit-inst-acronym" value={editForm.acronym} onChange={(e) => setEditForm((f) => ({ ...f, acronym: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-inst-email" className="text-sm">Email</label>
                  <Input id="edit-inst-email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="edit-inst-contact" className="text-sm">Contacto</label>
                  <Input id="edit-inst-contact" value={editForm.contactInfo} onChange={(e) => setEditForm((f) => ({ ...f, contactInfo: e.target.value }))} />
                </div>
              </Modal.Body>
              <Modal.Footer>
                <Button className="w-full" variant="secondary" onPress={() => { editModal.close(); setEditing(null); }}>Cancelar</Button>
                <Button className="w-full" variant="primary" isDisabled={!editForm.name.trim() || updateMutation.isPending} onPress={() => editing && updateMutation.mutate({ id: editing.id, data: editForm })}>
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
