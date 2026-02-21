const DEFAULT_API_BASE_URL = 'http://localhost:9500/api';
const DEFAULT_KEYCLOAK_URL = 'http://localhost:9090';
const DEFAULT_KEYCLOAK_REALM = 'videoclub';
const DEFAULT_KEYCLOAK_CLIENT_ID = 'web';
const FALLBACK_REDIRECT_URI = 'http://localhost:5173';

const isDev = Boolean(import.meta.env?.DEV);

const isBlank = (value) => typeof value !== 'string' || value.trim().length === 0;

export const normalizeUrlBase = (url) => url.trim().replace(/\/+$/, '');

export const isValidHttpUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const handleInvalidEnv = (key) => {
  if (isDev) {
    throw new Error(`Invalid env var: ${key}`);
  }
  console.warn(`[env] Invalid env var: ${key}. Falling back to default.`);
};

const resolveUrlEnv = (key, rawValue, fallback) => {
  const hasProvidedValue = rawValue !== undefined;

  if (!hasProvidedValue) {
    return normalizeUrlBase(fallback);
  }

  if (isBlank(rawValue)) {
    handleInvalidEnv(key);
    return normalizeUrlBase(fallback);
  }

  const normalized = normalizeUrlBase(rawValue);
  if (!isValidHttpUrl(normalized)) {
    handleInvalidEnv(key);
    return normalizeUrlBase(fallback);
  }

  return normalized;
};

const resolveStringEnv = (key, rawValue, fallback) => {
  const hasProvidedValue = rawValue !== undefined;

  if (!hasProvidedValue) {
    return fallback;
  }

  if (isBlank(rawValue)) {
    handleInvalidEnv(key);
    return fallback;
  }

  return rawValue.trim();
};

const defaultRedirectUri =
  typeof window !== 'undefined' && typeof window.location?.origin === 'string'
    ? normalizeUrlBase(window.location.origin)
    : FALLBACK_REDIRECT_URI;

export const APP_CONFIG = {
  apiBaseUrl: resolveUrlEnv('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL, DEFAULT_API_BASE_URL),
  keycloak: {
    url: resolveUrlEnv('VITE_KEYCLOAK_URL', import.meta.env.VITE_KEYCLOAK_URL, DEFAULT_KEYCLOAK_URL),
    realm: resolveStringEnv('VITE_KEYCLOAK_REALM', import.meta.env.VITE_KEYCLOAK_REALM, DEFAULT_KEYCLOAK_REALM),
    clientId: resolveStringEnv('VITE_KEYCLOAK_CLIENT_ID', import.meta.env.VITE_KEYCLOAK_CLIENT_ID, DEFAULT_KEYCLOAK_CLIENT_ID),
    redirectUri: resolveUrlEnv('VITE_KEYCLOAK_REDIRECT_URI', import.meta.env.VITE_KEYCLOAK_REDIRECT_URI, defaultRedirectUri),
  },
};
