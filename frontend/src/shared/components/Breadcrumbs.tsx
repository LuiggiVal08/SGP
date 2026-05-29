import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const labelMap: Record<string, string> = {
  profile: 'Mi Perfil',
  projects: 'Proyectos',
  new: 'Nuevo Proyecto',
  admin: 'Administración',
  careers: 'Carreras',
  institutions: 'Instituciones',
  users: 'Usuarios',
};

export function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, i) => {
    const path = '/' + segments.slice(0, i + 1).join('/');
    const label = labelMap[segment] ?? segment;
    const isLast = i === segments.length - 1;
    return { path, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-5">
      <ol className="flex items-center gap-1.5 text-sm text-muted">
        <li>
          <Link to="/" className="hover:text-foreground transition-colors inline-flex">
            <Home size={14} />
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.path} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-muted/50 shrink-0" />
            {crumb.isLast ? (
              <span className="text-foreground font-medium truncate max-w-40">{crumb.label}</span>
            ) : (
              <Link to={crumb.path} className="hover:text-foreground transition-colors truncate max-w-40">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
