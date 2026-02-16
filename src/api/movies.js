// src/api/movies.js
import { API_BASE } from './config.js';
import { emitDevEvent } from '../utils/devDiagnostics.js';

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toNonNegativeInteger(value, fallback) {
  const n = toFiniteNumber(value);
  if (n == null) {
    return fallback;
  }
  return Math.max(0, Math.trunc(n));
}

function toPositiveInteger(value, fallback) {
  const n = toFiniteNumber(value);
  if (n == null || n <= 0) {
    return fallback;
  }
  return Math.max(1, Math.trunc(n));
}

function adaptPagePayload(data, requestedPage = 0, requestedSize = 12) {
  const items = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.content)
      ? data.content
      : [];

  const total = toNonNegativeInteger(data?.total ?? data?.totalElements, 0);

  const page = toNonNegativeInteger(data?.page ?? data?.number, toNonNegativeInteger(requestedPage, 0));

  const size = toPositiveInteger(data?.size, toPositiveInteger(requestedSize, 1));

  const backendTotalPages = toFiniteNumber(data?.totalPages);
  const totalPages = Number.isFinite(backendTotalPages) && backendTotalPages > 0
    ? Math.max(1, backendTotalPages)
    : Math.max(1, Math.ceil(total / size));

  return { items, total, page, size, totalPages };
}

/**
 * Normaliza el DTO del backend al shape que espera la UI.
 * Evita tocar componentes si cambia el backend.
 */
function mapDTOtoUI(p = {}) {
  return {
    id: p.id,
    titulo: p.titulo ?? p.name ?? "",
    imagenUrl: p.imagenUrl ?? p.imagenThumb ?? p.poster ?? p.portada ?? "",
    genero: p.genero?.titulo ?? p.genero ?? "",
    formato: p.formato?.titulo ?? p.formato ?? "",
    condicion: p.condicion?.titulo ?? p.condicion ?? "",
    precio: p.precio ?? p.precioFinal ?? p.costo ?? 0,
    directores: Array.isArray(p.directores) ? p.directores.map(d => d.nombre ?? d) : [],
    actores: Array.isArray(p.actores) ? p.actores.map(a => a.nombre ?? a) : [],
    fechaSalida: p.fechaSalida ?? p.fecha_estreno ?? p.releaseDate ?? "",
    sinopsis: p.sinopsis ?? p.descripcion ?? p.description ?? "",
    rating: p.rating ?? p.puntuacion ?? 0,
    ratingPromedio: p.ratingPromedio ?? p.rating_promedio ?? 0,
    totalRatings: p.totalRatings ?? p.total_ratings ?? 0
  };
}

export async function searchMovies({ q = "", page = 0, size = 12, sort = "fechaSalida", dir = "desc", categoryId } = {}) {
  const normalizedDir = String(dir).toLowerCase() === "asc" ? "asc" : "desc";
  const normalizedPage = toNonNegativeInteger(page, 0);
  const normalizedSize = toPositiveInteger(size, 12);
  const normalizedQuery = String(q ?? "").trim();
  const params = new URLSearchParams();
  params.set("q", normalizedQuery);
  params.set("page", String(normalizedPage));
  params.set("size", String(normalizedSize));
  params.set("sort", String(sort ?? "fechaSalida"));
  params.set("dir", normalizedDir);
  
  // El backend espera el filtro por género con el parámetro "genero"
  if (categoryId != null && categoryId !== "") {
    params.set("genero", String(categoryId));
  }

  const url = `${API_BASE}/peliculas?${params.toString()}`;
  const isDev = import.meta.env?.DEV;

  if (isDev) {
    console.log("SEARCH_MOVIES_FINAL_URL", url);
  }

  if (isDev) {
    emitDevEvent("FETCH_MOVIES_REQUEST_START", {
      url,
      params: Object.fromEntries(params.entries()),
      page: normalizedPage,
      size: normalizedSize,
      sort,
      dir: normalizedDir,
      genero: categoryId ?? null,
      q: normalizedQuery,
    });
  }
  
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    if (isDev) {
      emitDevEvent("FETCH_MOVIES_REQUEST_ERROR", {
        url,
        page: normalizedPage,
        size: normalizedSize,
        error: err?.message || String(err),
      });
    }
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (isDev) {
      emitDevEvent("FETCH_MOVIES_RESPONSE_ERROR", {
        url,
        page: normalizedPage,
        size: normalizedSize,
        status: res.status,
        message: text || `HTTP ${res.status}`,
      });
    }
    throw new Error(text || `HTTP ${res.status}`);
  }
  const json = await res.json();
  const { items, total, totalPages, page: responsePage, size: responseSize } = adaptPagePayload(json, normalizedPage, normalizedSize);

  if (isDev) {
    emitDevEvent("FETCH_MOVIES_RESPONSE_OK", {
      url,
      status: res.status,
      payloadShape: {
        hasContent: Array.isArray(json?.content),
        hasItems: Array.isArray(json?.items),
        hasTotalElements: Object.prototype.hasOwnProperty.call(json ?? {}, 'totalElements'),
        hasTotal: Object.prototype.hasOwnProperty.call(json ?? {}, 'total'),
        hasNumber: Object.prototype.hasOwnProperty.call(json ?? {}, 'number'),
        hasPage: Object.prototype.hasOwnProperty.call(json ?? {}, 'page'),
        hasTotalPages: Object.prototype.hasOwnProperty.call(json ?? {}, 'totalPages'),
      },
      normalized: {
        requestedPage: normalizedPage,
        requestedSize: normalizedSize,
        page: responsePage,
        size: responseSize,
        total,
        totalPages,
        itemsLength: Array.isArray(items) ? items.length : 0,
      },
      total,
      totalPages,
      page: responsePage,
      size: responseSize,
    });

    console.log("SEARCH_MOVIES_NORMALIZED_OUTPUT", {
      requestedPage: normalizedPage,
      requestedSize: normalizedSize,
      page: responsePage,
      size: responseSize,
      total,
      totalPages,
      itemsLength: Array.isArray(items) ? items.length : 0,
    });
  }

  return {
    items: items.map(mapDTOtoUI),
    total,
    totalPages,
    page: responsePage,
    size: responseSize,
    status: res.status,
  };
}

export async function fetchCategories() {
  const url = `${API_BASE}/categorias`;
  const isDev = import.meta.env?.DEV;

  if (isDev) {
    console.log("FETCH_CATEGORIES_START", { url });
  }

  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    if (isDev) {
      console.error("FETCH_CATEGORIES_FETCH_ERROR", {
        name: err?.name,
        message: err?.message,
        url
      });
    }
    err.context = { url, method: "GET" };
    throw err;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (isDev) {
      console.error("FETCH_CATEGORIES_HTTP_ERROR", {
        status: res.status,
        url,
        message: text || `HTTP ${res.status}`
      });
    }
    throw new Error(text || `HTTP ${res.status}`);
  }
  const cats = await res.json();
  
  // Manejar tanto array de strings como array de objetos
  if (Array.isArray(cats)) {
    return cats.map((c, index) => {
      // Si es un string, crear objeto con id y titulo
      if (typeof c === 'string') {
        return {
          id: c, // Usar el nombre como id
          titulo: c
        };
      }
      // Si es un objeto, normalizar
      return {
        id: c.id ?? c.name ?? c.titulo ?? index,
        titulo: c.titulo ?? c.name ?? c.descripcion ?? ""
      };
    });
  }
  
  return [];
}
