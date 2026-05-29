import { useState } from 'react';
import { Button, Input, Card } from '@heroui/react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { catalogService } from '@/features/catalogs/services/catalog.service';
import { useCareers } from '@/features/catalogs/hooks/useCareers';
import { useInstitutions } from '@/features/catalogs/hooks/useInstitutions';
import { ArrowLeft } from 'lucide-react';

const roles = [
  { value: 'STUDENT', label: 'Estudiante' },
  { value: 'TUTOR', label: 'Tutor' },
  { value: 'ADMIN', label: 'Administrador' },
];

export default function AdminUserRegisterPage() {
  const navigate = useNavigate();
  const { data: careers = [] } = useCareers();
  const { data: institutions = [] } = useInstitutions();
  const [form, setForm] = useState({
    dni: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleName: 'STUDENT',
    careerId: '',
    institutionId: '',
  });

  const mutation = useMutation({
    mutationFn: () => catalogService.createUser(form),
    onSuccess: () => {
      navigate('/admin/users', { replace: true });
    },
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const isValid =
    form.dni.trim() &&
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.password.trim();

  return (
    <div>
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Volver a Usuarios
      </button>

      <h2 className="text-2xl font-semibold mb-6">Registrar Usuario</h2>

      <Card.Root variant="secondary" className="border border-border max-w-lg">
        <Card.Content className="p-6 space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm">Cédula</label>
            <Input value={form.dni} onChange={(e) => set('dni', e.target.value)} placeholder="Ej: 1234567" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm">Nombre</label>
              <Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Ej: Juan" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm">Apellido</label>
              <Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Ej: Pérez" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Email</label>
            <Input value={form.email} onChange={(e) => set('email', e.target.value)} type="email" placeholder="Ej: juan@example.com" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Contraseña</label>
            <Input value={form.password} onChange={(e) => set('password', e.target.value)} type="password" placeholder="••••••••" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Rol</label>
            <select
              value={form.roleName}
              onChange={(e) => set('roleName', e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Carrera</label>
            <select
              value={form.careerId}
              onChange={(e) => set('careerId', e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            >
              <option value="">Seleccionar carrera</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm">Institución</label>
            <select
              value={form.institutionId}
              onChange={(e) => set('institutionId', e.target.value)}
              className="border border-border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            >
              <option value="">Seleccionar institución</option>
              {institutions.map((i) => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-2">
            <Button variant="primary" isDisabled={!isValid || mutation.isPending} onPress={() => mutation.mutate()}>
              {mutation.isPending ? 'Registrando…' : 'Registrar Usuario'}
            </Button>
          </div>
          {mutation.isError && (
            <p className="text-danger text-sm text-center">Error al registrar. Verifique los datos.</p>
          )}
          {mutation.isSuccess && (
            <p className="text-success text-sm text-center">Usuario registrado correctamente.</p>
          )}
        </Card.Content>
      </Card.Root>
    </div>
  );
}
