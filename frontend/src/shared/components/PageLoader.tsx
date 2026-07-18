import { useNavigation } from 'react-router-dom';

/**
 * Top progress bar shown during client-side route transitions.
 * Smoother indeterminate shimmer + accessible status role
 * (skills: designing-beautiful-websites + accessibility).
 */
export function PageLoader() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div
      role="progressbar"
      aria-label="Cargando página"
      className={`fixed left-0 right-0 top-0 z-[60] h-1 transition-opacity duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="h-full w-full bg-primary/10">
        <div className="relative h-full w-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/3 animate-[loadingBar_1.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
        </div>
      </div>
    </div>
  );
}
