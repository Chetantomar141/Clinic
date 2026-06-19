import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    error: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('React render error:', error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-medical-bg flex items-center justify-center px-6 py-12 text-slate-800">
          <section className="w-full max-w-lg bg-white border border-red-200 rounded-2xl p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <div className="space-y-2">
                <h1 className="text-lg font-extrabold text-slate-950">Something went wrong</h1>
                <p className="text-sm text-slate-600">
                  The application recovered from an unexpected screen error.
                </p>
                <p className="text-xs text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2 break-words">
                  {this.state.error.message || 'Unknown application error'}
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="bg-primary hover:bg-primary-dark text-white font-bold text-xs px-4 py-2 rounded-xl transition"
                >
                  Reload
                </button>
              </div>
            </div>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
