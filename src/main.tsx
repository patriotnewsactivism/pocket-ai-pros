import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import { env } from "./config/env";
import "./index.css";

if (env.sentryDsn) {
  Sentry.init({
    dsn: env.sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({ blockAllMedia: true }),
    ],
    tracesSampleRate: env.isProduction ? 0.2 : 1.0,
    replaysSessionSampleRate: env.isProduction ? 0.1 : 1.0,
    replaysOnErrorSampleRate: 1.0,
  });
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
