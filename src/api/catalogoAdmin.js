import { API_BASE } from "./config.js";
import { createApiError } from "./errorNormalizer.js";

const STRICT_API_CONTRACT =
  import.meta.env?.VITE_STRICT_API_CONTRACT === "true" || Boolean(import.meta.env?.DEV);

const PAGE_RESPONSE_REQUIRED_FIELDS = ["items", "total", "page", "size", "totalPages"];

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function buildLegacyArrayResponse(payload, status) {
  return {
    items: payload,
    total: payload.length,
    page: 0,
    size: payload.length,
    totalPages: payload.length ? 1 : 0,
    status,
  };
}

function buildContractError(rawMessage, details = {}) {
  return createApiError({
    code: "API_CONTRACT_INVALID_PAGE_RESPONSE",
    details,
    rawMessage,
  });
}

async function parseErrorResponse(res, context = {}) {
  const text = await res.text().catch(() => "");
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (err) {
      payload = null;
    }
  }

  throw createApiError({
    code: payload?.code || payload?.errorCode || `HTTP_${res.status}`,
    httpStatus: res.status,
    details: payload,
    rawMessage: payload?.message || payload?.error || text || `HTTP ${res.status}`
  });
}

function rewrapNetworkErrorIfNeeded(err, context) {
  if (err?.name === "TypeError" && !Number.isFinite(err?.status)) {
    throw createApiError({
      code: "NETWORK_ERROR",
      details: context,
      rawMessage: err?.message,
      cause: err
    });
  }
}

export async function listMovies(accessToken, { q = "", page = 0, size = 20, sort = "fechaSalida", asc = false } = {}) {
  if (!accessToken) {
    throw createApiError({
      code: "AUTH_TOKEN_MISSING",
      httpStatus: 401
    });
  }

  const params = new URLSearchParams({
    q,
    page: String(page),
    size: String(size),
    sort,
    asc: String(asc)
  });

  const url = `${API_BASE}/admin/peliculas?${params.toString()}`;
  const isDev = import.meta.env?.DEV;
  const context = { url, method: "GET" };

  if (isDev) {
    console.log("LIST_MOVIES_REQUEST", context);
  }

  let res;
  try {
    res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  } catch (err) {
    rewrapNetworkErrorIfNeeded(err, context);
    if (isDev) {
      console.error("LIST_MOVIES_FETCH_ERROR", {
        name: err?.name,
        message: err?.message,
        ...context
      });
    }
    err.context = context;
    throw err;
  }

  if (!res.ok) {
    await parseErrorResponse(res, context);
  }

  const payload = await res.json();
  return validatePageResponse(payload, {
    status: res.status,
    strict: STRICT_API_CONTRACT,
    isDev,
    context,
  });
}

export function validatePageResponse(payload, { status, strict = STRICT_API_CONTRACT, isDev = Boolean(import.meta.env?.DEV), context = {} } = {}) {
  if (Array.isArray(payload)) {
    if (strict) {
      throw createApiError({
        code: "API_CONTRACT_LEGACY_ARRAY_NOT_ALLOWED",
        httpStatus: status,
        details: {
          receivedType: "array",
          ...context,
        },
        rawMessage: "Legacy array response is not allowed",
      });
    }

    if (isDev) {
      console.warn("LIST_MOVIES_LEGACY_ARRAY_RESPONSE", {
        status,
        url: context?.url,
        method: context?.method,
        length: payload.length,
      });
    }

    return buildLegacyArrayResponse(payload, status);
  }

  if (!payload || typeof payload !== "object") {
    throw buildContractError("Invalid page response payload type", {
      receivedType: typeof payload,
      ...context,
    });
  }

  const missingFields = PAGE_RESPONSE_REQUIRED_FIELDS.filter((field) => !(field in payload));
  if (missingFields.length > 0) {
    throw buildContractError("Invalid page response: missing required fields", {
      missingFields,
      ...context,
    });
  }

  if (!Array.isArray(payload.items)) {
    throw buildContractError("Invalid page response: items must be an array", context);
  }

  const numericFields = ["total", "page", "size", "totalPages"];
  const invalidNumericFields = numericFields.filter((field) => !isFiniteNumber(payload[field]));
  if (invalidNumericFields.length > 0) {
    throw buildContractError("Invalid page response: numeric fields are required", {
      invalidNumericFields,
      ...context,
    });
  }

  return {
    ...payload,
    status,
  };
}

// Backward-compatible helper used by existing tests/imports.
export function normalizeListPayload(payload, status) {
  return validatePageResponse(payload, {
    status,
    strict: false,
    isDev: false,
  });
}

export async function getMovieDetail(id) {
  if (!id) {
    throw createApiError({
      code: "VALIDATION_ID_REQUIRED",
      details: { field: "id" }
    });
  }

  const url = `${API_BASE}/peliculas/${encodeURIComponent(id)}`;
  const isDev = import.meta.env?.DEV;
  const context = { url, method: "GET" };

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    if (isDev) {
      console.error("GET_MOVIE_DETAIL_FETCH_ERROR", {
        name: err?.name,
        message: err?.message,
        ...context
      });
    }
    err.context = context;
    throw err;
  }

  if (!res.ok) {
    await parseErrorResponse(res, context);
  }

  return res.json();
}

export async function createMovie(accessToken, payload) {
  if (!accessToken) {
    throw createApiError({
      code: "AUTH_TOKEN_MISSING",
      httpStatus: 401
    });
  }

  const url = `${API_BASE}/admin/peliculas`;
  const isDev = import.meta.env?.DEV;
  const context = { url, method: "POST" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (isDev) {
      console.log("CREATE_MOVIE_RESPONSE", {
        status: res.status,
        ok: res.ok,
        type: res.type,
        redirected: res.redirected,
        contentType: res.headers.get("content-type"),
        contentLength: res.headers.get("content-length"),
        ...context
      });
    }

    if (!res.ok) {
      await parseErrorResponse(res, context);
    }

    return {
      status: res.status,
      ok: res.ok,
      contentType: res.headers.get("content-type"),
      contentLength: res.headers.get("content-length"),
      skippedBodyParse: true,
    };
  } catch (err) {
    rewrapNetworkErrorIfNeeded(err, context);
    if (isDev) {
      console.error("CREATE_MOVIE_FETCH_ERROR", {
        name: err?.name,
        message: err?.message,
        status: err?.status,
        ...context
      });
    }
    err.context = context;
    throw err;
  }
}

export async function updateMovie(accessToken, id, payload) {
  if (!accessToken) {
    throw createApiError({
      code: "AUTH_TOKEN_MISSING",
      httpStatus: 401
    });
  }
  if (!id) {
    throw createApiError({
      code: "VALIDATION_ID_REQUIRED",
      details: { field: "id" }
    });
  }

  const url = `${API_BASE}/admin/peliculas/${encodeURIComponent(id)}`;
  const isDev = import.meta.env?.DEV;
  const context = { url, method: "PUT" };

  let res;
  try {
    res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
    });
  } catch (err) {
    rewrapNetworkErrorIfNeeded(err, context);
    if (isDev) {
      console.error("UPDATE_MOVIE_FETCH_ERROR", {
        name: err?.name,
        message: err?.message,
        status: err?.status,
        ...context
      });
    }
    err.context = context;
    throw err;
  }

  if (!res.ok) {
    await parseErrorResponse(res, context);
  }

  if (isDev) {
    console.log("UPDATE_MOVIE_RESPONSE", {
      status: res.status,
      ok: res.ok,
      type: res.type,
      redirected: res.redirected,
      contentType: res.headers.get("content-type"),
      contentLength: res.headers.get("content-length"),
      skippedBodyParse: true,
      ...context
    });
  }

  return {
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get("content-type"),
    contentLength: res.headers.get("content-length"),
    skippedBodyParse: true,
  };
}

export async function retireMovie(accessToken, id) {
  if (!accessToken) {
    throw createApiError({
      code: "AUTH_TOKEN_MISSING",
      httpStatus: 401
    });
  }
  if (!id) {
    throw createApiError({
      code: "VALIDATION_ID_REQUIRED",
      details: { field: "id" }
    });
  }

  const url = `${API_BASE}/admin/peliculas/${encodeURIComponent(id)}`;
  const isDev = import.meta.env?.DEV;
  const context = { url, method: "DELETE" };

  let res;
  try {
    res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
    });
  } catch (err) {
    rewrapNetworkErrorIfNeeded(err, context);
    if (isDev) {
      console.error("RETIRE_MOVIE_FETCH_ERROR", {
        name: err?.name,
        message: err?.message,
        status: err?.status,
        ...context
      });
    }
    err.context = context;
    throw err;
  }

  if (!res.ok) {
    await parseErrorResponse(res, context);
  }

  if (isDev) {
    console.log("RETIRE_MOVIE_RESPONSE", {
      status: res.status,
      ok: res.ok,
      type: res.type,
      redirected: res.redirected,
      contentType: res.headers.get("content-type"),
      contentLength: res.headers.get("content-length"),
      skippedBodyParse: true,
      ...context
    });
  }

  return {
    status: res.status,
    ok: res.ok,
    contentType: res.headers.get("content-type"),
    contentLength: res.headers.get("content-length"),
    skippedBodyParse: true,
  };
}

export async function fetchDirectores(accessToken, { q = "", page, size } = {}) {
  if (!accessToken) {
    throw createApiError({
      code: "AUTH_TOKEN_MISSING",
      httpStatus: 401
    });
  }

  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (Number.isInteger(page) && page >= 0) params.set("page", String(page));
  if (Number.isInteger(size) && size > 0) params.set("size", String(size));

  const query = params.toString();
  const url = query
    ? `${API_BASE}/admin/directores?${query}`
    : `${API_BASE}/admin/directores`;
  const context = { url, method: "GET" };

  let res;
  try {
    res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  } catch (err) {
    rewrapNetworkErrorIfNeeded(err, context);
    err.context = context;
    throw err;
  }

  if (!res.ok) {
    await parseErrorResponse(res, context);
  }

  return res.json();
}

export async function createDirector(accessToken, payload) {
  if (!accessToken) {
    throw createApiError({
      code: "AUTH_TOKEN_MISSING",
      httpStatus: 401
    });
  }

  const url = `${API_BASE}/admin/directores`;
  const context = { url, method: "POST" };

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    rewrapNetworkErrorIfNeeded(err, context);
    err.context = context;
    throw err;
  }

  if (!res.ok) {
    await parseErrorResponse(res, context);
  }

  return res.json();
}

export async function fetchActores(accessToken, { q = "", page, size } = {}) {
  if (!accessToken) {
    throw createApiError({
      code: "AUTH_TOKEN_MISSING",
      httpStatus: 401
    });
  }

  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (Number.isInteger(page) && page >= 0) params.set("page", String(page));
  if (Number.isInteger(size) && size > 0) params.set("size", String(size));

  const query = params.toString();
  const url = query
    ? `${API_BASE}/admin/actores?${query}`
    : `${API_BASE}/admin/actores`;
  const context = { url, method: "GET" };

  let res;
  try {
    res = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${accessToken}`
      }
    });
  } catch (err) {
    rewrapNetworkErrorIfNeeded(err, context);
    err.context = context;
    throw err;
  }

  if (!res.ok) {
    await parseErrorResponse(res, context);
  }

  return res.json();
}

export async function createActor(accessToken, payload) {
  if (!accessToken) {
    throw createApiError({
      code: "AUTH_TOKEN_MISSING",
      httpStatus: 401
    });
  }

  const url = `${API_BASE}/admin/actores`;
  const context = { url, method: "POST" };

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    rewrapNetworkErrorIfNeeded(err, context);
    err.context = context;
    throw err;
  }

  if (!res.ok) {
    await parseErrorResponse(res, context);
  }

  return res.json();
}

export async function fetchGeneros(accessToken, { q = "", page = 0, size = 15 } = {}) {
  const url = `${API_BASE}/categorias`;
  const context = { url, method: "GET" };

  let res;
  try {
    res = await fetch(url, {
      headers: accessToken
        ? {
            "Authorization": `Bearer ${accessToken}`
          }
        : undefined
    });
  } catch (err) {
    rewrapNetworkErrorIfNeeded(err, context);
    err.context = context;
    throw err;
  }

  if (!res.ok) {
    await parseErrorResponse(res, context);
  }

  const payload = await res.json();
  const normalizedQuery = String(q || "").trim().toLowerCase();
  const source = Array.isArray(payload) ? payload : [];
  const names = source
    .map((item) => (typeof item === "string" ? item : String(item?.nombre || item?.titulo || "")))
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .filter((name) => !normalizedQuery || name.toLowerCase().includes(normalizedQuery));

  const start = Math.max(0, Number(page) || 0) * Math.max(1, Number(size) || 15);
  const end = start + Math.max(1, Number(size) || 15);
  return names.slice(start, end);
}

export async function fetchFormatos(accessToken, { q = "", page = 0, size = 15 } = {}) {
  const params = new URLSearchParams({
    page: "0",
    size: "200",
    sort: "titulo",
    asc: "true",
  });

  const url = `${API_BASE}/peliculas?${params.toString()}`;
  const context = { url, method: "GET" };

  let res;
  try {
    res = await fetch(url, {
      headers: accessToken
        ? {
            "Authorization": `Bearer ${accessToken}`
          }
        : undefined
    });
  } catch (err) {
    rewrapNetworkErrorIfNeeded(err, context);
    err.context = context;
    throw err;
  }

  if (!res.ok) {
    await parseErrorResponse(res, context);
  }

  const payload = await res.json();
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const normalizedQuery = String(q || "").trim().toLowerCase();

  const unique = new Map();
  for (const item of items) {
    const raw = String(item?.formato || item?.formatoNombre || "").trim();
    if (!raw) continue;
    const key = raw.toLowerCase();
    if (!normalizedQuery || key.includes(normalizedQuery)) {
      if (!unique.has(key)) unique.set(key, raw);
    }
  }

  const names = Array.from(unique.values()).sort((a, b) => a.localeCompare(b, "es"));
  const start = Math.max(0, Number(page) || 0) * Math.max(1, Number(size) || 15);
  const end = start + Math.max(1, Number(size) || 15);
  return names.slice(start, end);
}
