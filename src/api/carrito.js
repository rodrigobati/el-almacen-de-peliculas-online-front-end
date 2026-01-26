// src/api/carrito.js
import { API_BASE } from './config.js';

/**
 * Mapea un item del carrito DTO a la forma esperada por la UI.
 */
function mapItemDTOtoUI(item = {}) {
  return {
    peliculaId: item.peliculaId ?? item.id ?? "",
    titulo: item.titulo ?? item.name ?? "",
    precioUnitario: item.precioUnitario ?? item.precio ?? 0,
    cantidad: item.cantidad ?? item.quantity ?? 1,
    subtotal: item.subtotal ?? 0
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

/**
 * Obtiene el carrito de un cliente.
 */
export async function fetchCarrito(clienteId) {
  if (!clienteId) {
    throw new Error("clienteId es requerido");
  }

  const url = `${API_BASE}/clientes/${encodeURIComponent(clienteId)}/carrito`;
  
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  
  const json = await res.json();
  return mapCarritoDTOtoUI(json);
}

/**
 * Agrega una película al carrito (o incrementa cantidad si ya existe).
 * 
 * @param {string} clienteId - Identificador del cliente
 * @param {object} pelicula - Objeto con { peliculaId, titulo, precio, cantidad }
 */
export async function agregarAlCarrito(clienteId, pelicula) {
  if (!clienteId) {
    throw new Error("clienteId es requerido");
  }
  if (!pelicula || !pelicula.peliculaId) {
    throw new Error("peliculaId es requerido");
  }

  const url = `${API_BASE}/clientes/${encodeURIComponent(clienteId)}/carrito/items`;
  
  const body = {
    peliculaId: pelicula.peliculaId,
    titulo: pelicula.titulo ?? "",
    precioUnitario: pelicula.precio ?? 0,
    cantidad: pelicula.cantidad ?? 1
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json = await res.json();
  return mapCarritoDTOtoUI(json);
}

/**
 * Elimina una película del carrito.
 */
export async function eliminarDelCarrito(clienteId, peliculaId) {
  if (!clienteId) {
    throw new Error("clienteId es requerido");
  }
  if (!peliculaId) {
    throw new Error("peliculaId es requerido");
  }

  const url = `${API_BASE}/clientes/${encodeURIComponent(clienteId)}/carrito/items/${encodeURIComponent(peliculaId)}`;
  
  const res = await fetch(url, {
    method: "DELETE"
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  const json = await res.json();
  return mapCarritoDTOtoUI(json);
}
