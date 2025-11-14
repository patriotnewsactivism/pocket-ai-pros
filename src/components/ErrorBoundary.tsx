import type { ReactNode } from "react";
import * as Sentry from "@sentry/react";
import { ErrorFallback } from "@/components/ErrorFallback";

interface ErrorBoundaryProps {
  children: ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary fallback={({ error, resetError }) => (
      <ErrorFallback error={error} resetErrorBoundary={resetError} />
    )}>
      {children}
    </Sentry.ErrorBoundary>
  );
}
