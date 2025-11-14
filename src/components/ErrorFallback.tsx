import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const canUseBrowserNavigation = typeof window !== "undefined" && import.meta.env.MODE !== "test";

  const handleRetry = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
      return;
    }

    if (canUseBrowserNavigation) {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (canUseBrowserNavigation) {
      window.location.href = "/";
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border/60 bg-card p-6 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground" role="status">
            {error?.message ?? "An unexpected error occurred. Please try again."}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button type="button" onClick={handleRetry} variant="hero" className="w-full sm:w-auto">
            Try Again
          </Button>
          <Button type="button" variant="outline" onClick={handleGoHome} className="w-full sm:w-auto">
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
