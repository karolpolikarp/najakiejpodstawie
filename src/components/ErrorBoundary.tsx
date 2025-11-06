import { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

/**
 * Error Boundary component to catch and handle React errors gracefully
 * Prevents the entire app from crashing when a component error occurs
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // You can also log to an error reporting service here
    // Example: Sentry.captureException(error, { extra: errorInfo });

    this.setState({
      errorInfo: errorInfo.componentStack,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-main p-4">
          <div className="max-w-lg w-full">
            <div className="bg-card border border-destructive/20 rounded-lg p-8 shadow-lg">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                  <AlertTriangle className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Coś poszło nie tak
                </h1>
                <p className="text-muted-foreground">
                  Przepraszamy za problemy techniczne. Spróbuj odświeżyć stronę lub skontaktuj się z pomocą techniczną.
                </p>
              </div>

              {/* Show error details in development */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-destructive/5 rounded border border-destructive/20">
                  <p className="text-sm font-semibold text-destructive mb-2">
                    Error Details (dev only):
                  </p>
                  <p className="text-xs text-muted-foreground font-mono break-words mb-2">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs text-muted-foreground">
                      <summary className="cursor-pointer hover:text-foreground">
                        Component Stack
                      </summary>
                      <pre className="mt-2 overflow-auto max-h-32 whitespace-pre-wrap">
                        {this.state.errorInfo}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={this.handleReload}
                  className="flex-1"
                  size="lg"
                >
                  Odśwież stronę
                </Button>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Spróbuj ponownie
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center mt-6">
                Jeśli problem się powtarza, skontaktuj się z nami poprzez stronę kontaktową.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
