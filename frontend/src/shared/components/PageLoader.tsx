import { useNavigation } from 'react-router-dom';

export function PageLoader() {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <div
      role="progressbar" aria-label="Cargando página"
      className={`fixed top-0 left-0 right-0 z-50 h-1 transition-opacity duration-300 ${
        isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="h-full bg-primary/20 w-full overflow-hidden">
        <div className="h-full bg-primary rounded-full w-1/2 animate-[loadingBar_1.4s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
