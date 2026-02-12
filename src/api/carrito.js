// src/api/carrito.js
import { API_BASE } from './config.js';

/**
 * Mapea un item del carrito DTO a la forma esperada por la UI.
 */
function mapItemDTOtoUI(item = {}) {
  const precioUnitario = Number(item.precioUnitario ?? item.precio ?? 0);
  const cantidad = Number(item.cantidad ?? item.quantity ?? 1);
  const subtotal = item.subtotal ?? (precioUnitario * cantidad);
  
  return {
    peliculaId: item.peliculaId ?? item.id ?? "",
    titulo: item.titulo ?? item.name ?? "",
    precioUnitario,
    cantidad,
    subtotal
  };
}

/**
 * Mapea el carrito DTO completo a la forma esperada por la UI.
 */
function mapCarritoDTOtoUI(dto = {}) {
  return {
    items: Array.isArray(dto.items) ? dto.items.map(mapItemDTOtoUI) : [],
    total: dto.total ?? 0
  };
}

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

/**
 * Obtiene el carrito del usuario autenticado.
 * @param {string} accessToken - Token JWT de Keycloak
 */
export async function fetchCarrito(accessToken) {
  if (!accessToken) {
    throw new Error("Usuario no autenticado");
  }

  const url = `${API_BASE}/carrito`;
  
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  
  if (!res.ok) {
    await parseErrorResponse(res);
  }
  
  const json = await res.json();
  return mapCarritoDTOtoUI(json);
}

/**
 * Agrega una película al carrito (o incrementa cantidad si ya existe).
 * @param {string} accessToken - Token JWT de Keycloak
 * @param {object} pelicula - Objeto con { peliculaId, titulo, precio, cantidad }
 */
export async function agregarAlCarrito(accessToken, pelicula) {
  if (!accessToken) {
    throw new Error("Usuario no autenticado");
  }
  if (!pelicula || !pelicula.peliculaId) {
    throw new Error("peliculaId es requerido");
  }

  const url = `${API_BASE}/carrito/items`;
  
  const body = {
    peliculaId: pelicula.peliculaId,
    titulo: pelicula.titulo ?? "",
    precioUnitario: pelicula.precio ?? 0,
    cantidad: pelicula.cantidad ?? 1
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    await parseErrorResponse(res);
  }

  const json = await res.json();
  return mapCarritoDTOtoUI(json);
}

/**
 * Elimina una película del carrito.
 * @param {string} accessToken - Token JWT de Keycloak
 * @param {string} peliculaId - ID de la película a eliminar
 */
export async function eliminarDelCarrito(accessToken, peliculaId) {
  if (!accessToken) {
    throw new Error("Usuario no autenticado");
  }
  if (!peliculaId) {
    throw new Error("peliculaId es requerido");
  }

  const url = `${API_BASE}/carrito/items/${encodeURIComponent(peliculaId)}`;
  
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    await parseErrorResponse(res);
  }

  const json = await res.json();
  return mapCarritoDTOtoUI(json);
}

/**
 * Decrementa una unidad de una película en el carrito.
 * @param {string} accessToken - Token JWT de Keycloak
 * @param {string} peliculaId - ID de la película a decrementar
 */
export async function decrementarDelCarrito(accessToken, peliculaId) {
  if (!accessToken) {
    throw new Error("Usuario no autenticado");
  }
  if (!peliculaId) {
    throw new Error("peliculaId es requerido");
  }

  const url = `${API_BASE}/carrito/items/${encodeURIComponent(peliculaId)}/decrement`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    await parseErrorResponse(res);
  }

  const json = await res.json();
  return mapCarritoDTOtoUI(json);
}
