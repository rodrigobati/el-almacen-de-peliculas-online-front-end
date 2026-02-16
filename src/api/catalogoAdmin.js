import { API_BASE } from "./config.js";

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

  const backendMessage = payload?.message || payload?.error || text || "";
  const excerpt = backendMessage ? String(backendMessage).slice(0, 300) : "";
  const message = excerpt
    ? `HTTP ${res.status} - ${excerpt}`
    : `HTTP ${res.status}`;
  const error = new Error(message);
  error.status = res.status;
  error.details = payload;
  error.responseText = text;
  error.context = context;
  throw error;
}

function rewrapNetworkErrorIfNeeded(err, context) {
  if (err?.name === "TypeError" && !Number.isFinite(err?.status)) {
    const networkError = new Error(`Network/CORS - ${err.message}`);
    networkError.name = err.name;
    networkError.cause = err;
    networkError.context = context;
    throw networkError;
  }
}

export async function listMovies({ q = "", page = 0, size = 20, sort = "fechaSalida", asc = false } = {}) {
  const params = new URLSearchParams({
    q,
    page: String(page),
    size: String(size),
    sort,
    asc: String(asc)
  });

  const url = `${API_BASE}/peliculas?${params.toString()}`;
  const isDev = import.meta.env?.DEV;
  const context = { url, method: "GET" };

  if (isDev) {
    console.log("LIST_MOVIES_REQUEST", context);
  }

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
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
  return {
    ...payload,
    status: res.status,
  };
}

export async function getMovieDetail(id) {
  if (!id) {
    throw new Error("id es requerido");
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
    throw new Error("Usuario no autenticado");
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
    throw new Error("Usuario no autenticado");
  }
  if (!id) {
    throw new Error("id es requerido");
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
    throw new Error("Usuario no autenticado");
  }
  if (!id) {
    throw new Error("id es requerido");
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
    throw new Error("Usuario no autenticado");
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
    throw new Error("Usuario no autenticado");
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
    throw new Error("Usuario no autenticado");
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
    throw new Error("Usuario no autenticado");
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
