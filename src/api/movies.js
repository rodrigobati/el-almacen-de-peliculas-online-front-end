// src/api/movies.js
const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/**
 * Adapta cualquier payload común a la forma { items, total }
 */
function adaptPagePayload(data) {
  if (!data) return { items: [], total: 0 };

  // Caso 1: ya viene en el formato de la UI
  if (Array.isArray(data.items) && typeof data.total === "number") {
    return data;
  }
  // Caso 2: Spring Data Page
  if (Array.isArray(data.content) && typeof data.totalElements === "number") {
    return { items: data.content, total: data.totalElements };
  }
  // Caso 3: otros convencionales
  if (Array.isArray(data.results) && typeof data.count === "number") {
    return { items: data.results, total: data.count };
  }
  // Caso 4: lista simple sin total
  if (Array.isArray(data)) {
    return { items: data, total: data.length };
  }
  return { items: [], total: 0 };
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
    rating: p.rating ?? p.puntuacion ?? 0
  };
}

export async function searchMovies({ q = "", page = 0, size = 12, sort = "fechaSalida", dir = "desc", categoryId } = {}) {
  const params = new URLSearchParams({ q, page, size, sort, dir });
  if (categoryId != null && categoryId !== "") params.set("categoryId", String(categoryId));

  const res = await fetch(`${BASE}/api/peliculas?${params.toString()}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const json = await res.json();
  const { items, total } = adaptPagePayload(json);
  return { items: items.map(mapDTOtoUI), total };
}

export async function fetchCategories() {
  const res = await fetch(`${BASE}/api/categorias`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  const cats = await res.json();
  // Normalización mínima
  return (Array.isArray(cats) ? cats : []).map(c => ({
    id: c.id,
    titulo: c.titulo ?? c.name ?? c.descripcion ?? ""
  }));
}
