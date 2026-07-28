// Minimal API fetch wrapper for attaching Authorization header
// - Builds URL from import.meta.env.VITE_API_BASE_URL (fallback to http://localhost:9500/api)
// - Accepts a token source as third param: function | object | string
//   If object has updateToken(fn) it will call it to refresh token before use.

const DEFAULT_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:9500/api').replace(/\/$/, '');

async function resolveToken(tokenSource) {
  if (!tokenSource) return null;

  // If source is a function, call it (allow sync or async)
  if (typeof tokenSource === 'function') {
    try {
      const v = tokenSource();
      return (v && typeof v.then === 'function') ? await v : v;
    } catch (e) {
      console.warn('tokenSource function threw', e);
      return null;
    }
  }

  // If source is an object that resembles Keycloak (has updateToken), refresh it
  if (typeof tokenSource === 'object') {
    try {
      if (typeof tokenSource.updateToken === 'function') {
        // ask Keycloak to refresh if the token is near expiry
        await tokenSource.updateToken(5).catch(() => {});
      }
      // prefer token property
      return tokenSource.token || null;
    } catch (e) {
      console.warn('Error resolving token from object source', e);
      return null;
    }
  }

  // If it's a string, assume it's the token
  if (typeof tokenSource === 'string') return tokenSource;

  return null;
}

export async function apiFetch(path, options = {}, tokenSource) {
  const url = path.startsWith('/') ? `${DEFAULT_BASE}${path}` : `${DEFAULT_BASE}/${path}`;

  const opts = { ...options };
  opts.headers = { ...(opts.headers || {}) };

  // If body is a plain object and Content-Type not set, stringify and set header
  if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
    if (!opts.headers['Content-Type'] && !opts.headers['content-type']) {
      opts.headers['Content-Type'] = 'application/json';
    }
    if (opts.headers['Content-Type'].includes('application/json') && typeof opts.body !== 'string') {
      opts.body = JSON.stringify(opts.body);
    }
  }

  const token = await resolveToken(tokenSource);
  if (token) {
    opts.headers = { ...opts.headers, Authorization: `Bearer ${token}` };
  }

  return fetch(url, opts);
}

export default apiFetch;
