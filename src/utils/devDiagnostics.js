const isDevDiagnosticsEnabled = () => Boolean(import.meta?.env?.DEV || globalThis.__FORCE_DEV_DIAG__ === true);

export function emitDevEvent(event, payload = {}) {
  if (!isDevDiagnosticsEnabled()) {
    return;
  }

  const entry = {
    ts: new Date().toISOString(),
    event,
    ...payload,
  };

  if (typeof window !== "undefined") {
    window.__APP_DEV_VERIFY_LOGS = window.__APP_DEV_VERIFY_LOGS || [];
    window.__APP_DEV_VERIFY_LOGS.push(entry);
  }

  console.info(`[DEV_DIAG] ${event}`, entry);
}
