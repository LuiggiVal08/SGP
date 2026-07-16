import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-dvh flex items-center justify-center bg-background p-6">
          <div className="text-center max-w-sm">
            <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-danger/10 flex items-center justify-center">
              <AlertTriangle size={28} className="text-danger" />
            </div>
            <h1 className="text-lg font-bold text-foreground mb-2">Algo salió mal</h1>
            <p className="text-sm text-muted mb-6">
              Ocurrió un error inesperado. Intenta recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <RefreshCw size={16} />
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
