import { CreateProjectForm } from '../components/CreateProjectForm';
import { usePageTitle } from '@/shared/hooks/usePageTitle';

export default function CreateProjectPage() {
  usePageTitle('Nuevo Proyecto');
  return <CreateProjectForm />;
}
