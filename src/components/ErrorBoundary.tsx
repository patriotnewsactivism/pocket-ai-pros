import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log in development to avoid exposing sensitive info
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }

    // Check if this is a chunk load error (stale cache issue)
    const isChunkLoadError =
      error.name === 'ChunkLoadError' ||
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Importing a module script failed');

    if (isChunkLoadError) {
      console.warn('[ErrorBoundary] Chunk load error detected, app may need reload');
    }

    // TODO: Send to error tracking service (Sentry, etc.) in production
    // Example: Sentry.captureException(error, {
    //   contexts: { react: { componentStack: errorInfo.componentStack } }
    // });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private isChunkLoadError = (): boolean => {
    if (!this.state.error) return false;
    return (
      this.state.error.name === 'ChunkLoadError' ||
      this.state.error.message.includes('Failed to fetch dynamically imported module') ||
      this.state.error.message.includes('Importing a module script failed')
    );
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isChunkError = this.isChunkLoadError();

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {isChunkError ? 'Update Required' : 'Something went wrong'}
              </h1>
              <p className="text-muted-foreground">
                {isChunkError
                  ? 'A new version of the app is available. Please reload the page to get the latest updates.'
                  : 'We apologize for the inconvenience. An unexpected error has occurred.'}
              </p>
              {this.state.error && !isChunkError && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                    Error details
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
            <div className="flex gap-4 justify-center">
              {isChunkError ? (
                <Button onClick={this.handleReload} variant="hero">
                  Reload Page
                </Button>
              ) : (
                <>
                  <Button onClick={this.handleReset} variant="hero">
                    Try Again
                  </Button>
                  <Button onClick={() => window.location.href = '/'} variant="outline">
                    Go Home
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
