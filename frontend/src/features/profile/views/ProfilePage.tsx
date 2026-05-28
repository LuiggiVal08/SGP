import { Avatar, Card, Chip } from '@heroui/react';
import { useAuthStore } from '@/shared/store/auth.store';
import { Mail, Shield, User } from 'lucide-react';

const roleConfig: Record<string, { label: string; color: 'success' | 'warning' | 'default' }> = {
  ADMIN: { label: 'Administrador', color: 'success' },
  TUTOR: { label: 'Tutor', color: 'warning' },
  STUDENT: { label: 'Estudiante', color: 'default' },
};

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  const role = roleConfig[user.role] ?? { label: user.role, color: 'default' as const };

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card.Root variant="secondary" className="border border-border">
        <div className="h-28 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/10" />

        <Card.Content className="px-6 pb-6">
          <div className="-mt-14 mb-4 flex items-end justify-between">
            <Avatar size="xl" color="accent" className="ring-4 ring-background shadow-lg">
              <Avatar.Fallback className="text-lg">{initials}</Avatar.Fallback>
            </Avatar>
            <Chip color={role.color} variant="soft" size="sm">
              {role.label}
            </Chip>
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            {user.firstName} {user.lastName}
          </h1>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Mail size={16} />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Email</p>
                <p className="text-sm text-foreground font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Shield size={16} />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">Rol</p>
                <p className="text-sm text-foreground font-medium">{role.label}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
              <div className="p-2 rounded-lg bg-warning/10 text-warning">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wider">ID Usuario</p>
                <p className="text-sm text-foreground font-medium font-mono text-xs">{user.id}</p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
