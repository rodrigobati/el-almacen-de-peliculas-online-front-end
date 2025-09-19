// src/api/movies.js
import { API_BASE } from './config';

const asQuery = (params = {}) =>
  Object.entries(params)
    .filter(([,v]) => v !== undefined && v !== null && v !== '')
    .map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');

export async function searchMovies({ q='', genero='', formato='', condicion='', actor='', director='', page=0, size=12 } = {}) {
  const qs = asQuery({ q, genero, formato, condicion, actor, director, page, size });
  const res = await fetch(`${API_BASE}/peliculas?${qs}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // { items, total, page, size }
}

export async function getMovie(id) {
  const res = await fetch(`${API_BASE}/peliculas/${id}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json(); // DetallePeliculaDTO
}
