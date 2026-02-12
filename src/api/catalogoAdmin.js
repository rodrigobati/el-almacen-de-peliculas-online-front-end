import { API_BASE } from "./config.js";

async function parseErrorResponse(res) {
  const text = await res.text().catch(() => "");
  let payload = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch (err) {
      payload = null;
    }
  }

  const message = payload?.message || payload?.error || text || `HTTP ${res.status}`;
  const error = new Error(message);
  error.status = res.status;
  error.details = payload;
  throw error;
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
  const res = await fetch(url);

  if (!res.ok) {
    await parseErrorResponse(res);
  }

  return res.json();
}

export async function getMovieDetail(id) {
  if (!id) {
    throw new Error("id es requerido");
  }

  const url = `${API_BASE}/peliculas/${encodeURIComponent(id)}`;
  const res = await fetch(url);

  if (!res.ok) {
    await parseErrorResponse(res);
  }

  return res.json();
}

export async function createMovie(accessToken, payload) {
  if (!accessToken) {
    throw new Error("Usuario no autenticado");
  }

  const url = `${API_BASE}/admin/peliculas`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await parseErrorResponse(res);
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
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    await parseErrorResponse(res);
  }
}

export async function retireMovie(accessToken, id) {
  if (!accessToken) {
    throw new Error("Usuario no autenticado");
  }
  if (!id) {
    throw new Error("id es requerido");
  }

  const url = `${API_BASE}/admin/peliculas/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    await parseErrorResponse(res);
  }
}
