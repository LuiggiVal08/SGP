import { useSearchParams } from 'react-router-dom';
import { Button } from '@heroui/react';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { ProjectsTable } from '../components/ProjectsTable';
import { usePageTitle } from '@/shared/hooks/usePageTitle';
import { useAuthStore } from '@/shared/store/auth.store';
import { isStudent } from '@/shared/utils/role';

export default function ProjectsListPage() {
  usePageTitle('Proyectos');
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [searchParams] = useSearchParams();
  const authorId = searchParams.get('authorId') ?? undefined;

  const isOwnView = isStudent(user?.role) && authorId === user?.id;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-primary to-primary/40" />
          <h1 className="text-2xl font-bold text-foreground pl-3">
            {isOwnView ? 'Mi Proyecto' : 'Proyectos'}
          </h1>
          <p className="text-sm text-muted mt-1 pl-3">
            {isOwnView
              ? 'Visualiza y gestiona tu proyecto de grado'
              : 'Explora y filtra todos los proyectos registrados'}
          </p>
        </div>
        {!isOwnView && (
          <Button
            variant="primary"
            onPress={() => navigate('/projects/new')}
            className="gap-2"
          >
            <PlusCircle size={18} />
            Crear Proyecto
          </Button>
        )}
      </div>
      <ProjectsTable authorId={authorId} />
    </div>
  );
}
