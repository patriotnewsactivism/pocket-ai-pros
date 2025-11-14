import * as Sentry from "@sentry/react";

export const initSentry = () => {
  // Only initialize in production with Sentry DSN configured
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // Capture 10% of transactions
      // Session Replay
      replaysSessionSampleRate: 0.1, // Sample 10% of sessions
      replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors
      
      // Filter out sensitive data
      beforeSend(event) {
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
            if (breadcrumb.data) {
              delete breadcrumb.data.password;
              delete breadcrumb.data.token;
              delete breadcrumb.data.apiKey;
            }
            return breadcrumb;
          });
        }
        return event;
      },
      
      environment: import.meta.env.MODE,
    });
  }
};
