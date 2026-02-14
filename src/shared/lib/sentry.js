import * as Sentry from "@sentry/react";

const DEFAULT_SENTRY_DSN =
  "https://2da86195002de6bb0c4bd07601b37b0e@o4510880856145920.ingest.de.sentry.io/4510880949993552";

const toBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value).toLowerCase() === "true";
};

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

let initialized = false;

export function initSentry() {
  if (initialized) return;

  const dsn = import.meta.env.VITE_SENTRY_DSN || DEFAULT_SENTRY_DSN;
  if (!dsn) return;

  const isProd = import.meta.env.PROD;
  const tracePropagationTargets = ["localhost", /^\/api/];
  if (import.meta.env.VITE_API_URL) {
    tracePropagationTargets.push(import.meta.env.VITE_API_URL);
  }

  Sentry.init({
    dsn,
    environment:
      import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    sendDefaultPii: toBoolean(
      import.meta.env.VITE_SENTRY_SEND_DEFAULT_PII,
      true
    ),
    enableLogs: toBoolean(import.meta.env.VITE_SENTRY_ENABLE_LOGS, true),
    enableMetrics: true,
    tracesSampleRate: toNumber(
      import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE,
      isProd ? 0.2 : 1.0
    ),
    replaysSessionSampleRate: toNumber(
      import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
      isProd ? 0.1 : 1.0
    ),
    replaysOnErrorSampleRate: toNumber(
      import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
      1.0
    ),
    tracePropagationTargets,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.consoleLoggingIntegration({
        levels: ["log", "warn", "error"],
      }),
    ],
  });

  Sentry.metrics.count("frontend.app_init", 1, {
    attributes: {
      environment: import.meta.env.MODE,
    },
  });

  initialized = true;
}

export { Sentry };
