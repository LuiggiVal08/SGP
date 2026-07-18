import { useParams } from 'react-router-dom';
import ProjectCorrectionsPage from './ProjectCorrectionsPage';

export default function ProjectCorrectionsRoute() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <ProjectCorrectionsPage projectId={id} />;
}
