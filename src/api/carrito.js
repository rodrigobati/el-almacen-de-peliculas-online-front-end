// src/api/carrito.js
import { API_BASE } from './config.js';
import { createApiError, normalizeApiError } from './errorNormalizer.js';

function readClienteId() {
  try {
    return localStorage.getItem("clienteId") || "";
  } catch {
    return "";
  }
}

function buildAuthHeaders(accessToken, method = "GET") {
  const headers = {};
  const hasToken = Boolean(accessToken);
  const clienteId = readClienteId();

  if (method.toUpperCase() === "POST") {
    headers["Content-Type"] = "application/json";
  }

  if (hasToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if ((import.meta.env.DEV || !hasToken) && clienteId) {
    headers["X-Cliente-Id"] = clienteId;
  }

  return headers;
}

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

  throw createApiError({
    code: payload?.code || payload?.errorCode || `HTTP_${res.status}`,
    httpStatus: res.status,
    details: payload,
    rawMessage: payload?.message || payload?.error || text || `HTTP ${res.status}`
  });
}

/**
 * Obtiene el carrito del usuario autenticado.
 * @param {string} accessToken - Token JWT de Keycloak
 */
export async function fetchCarrito(accessToken) {
  const url = `${API_BASE}/carrito`;

  try {
    const res = await fetch(url, {
      headers: buildAuthHeaders(accessToken)
    });

    if (!res.ok) {
      await parseErrorResponse(res);
    }

    const json = await res.json();
    return mapCarritoDTOtoUI(json);
  } catch (error) {
    throw normalizeApiError(error, { fallbackCode: "UNKNOWN_ERROR" });
  }
}

/**
 * Agrega una película al carrito (o incrementa cantidad si ya existe).
 * @param {string} accessToken - Token JWT de Keycloak
 * @param {object} pelicula - Objeto con { peliculaId, titulo, precio, cantidad }
 */
export async function agregarAlCarrito(accessToken, pelicula) {
  if (!pelicula || !pelicula.peliculaId) {
    throw createApiError({
      code: "VALIDATION_PELICULA_ID_REQUIRED",
      details: { field: "peliculaId" }
    });
  }

  const url = `${API_BASE}/carrito/items`;

  const body = {
    peliculaId: pelicula.peliculaId,
    titulo: pelicula.titulo ?? "",
    precioUnitario: pelicula.precio ?? 0,
    cantidad: pelicula.cantidad ?? 1
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: buildAuthHeaders(accessToken, "POST"),
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      await parseErrorResponse(res);
    }

    const json = await res.json();
    return mapCarritoDTOtoUI(json);
  } catch (error) {
    throw normalizeApiError(error, { fallbackCode: "UNKNOWN_ERROR" });
  }
}

/**
 * Elimina una película del carrito.
 * @param {string} accessToken - Token JWT de Keycloak
 * @param {string} peliculaId - ID de la película a eliminar
 */
export async function eliminarDelCarrito(accessToken, peliculaId) {
  if (!peliculaId) {
    throw createApiError({
      code: "VALIDATION_PELICULA_ID_REQUIRED",
      details: { field: "peliculaId" }
    });
  }

  const url = `${API_BASE}/carrito/items/${encodeURIComponent(peliculaId)}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: buildAuthHeaders(accessToken)
    });

    if (!res.ok) {
      await parseErrorResponse(res);
    }

    const json = await res.json();
    return mapCarritoDTOtoUI(json);
  } catch (error) {
    throw normalizeApiError(error, { fallbackCode: "UNKNOWN_ERROR" });
  }
}

/**
 * Decrementa una unidad de una película en el carrito.
 * @param {string} accessToken - Token JWT de Keycloak
 * @param {string} peliculaId - ID de la película a decrementar
 */
export async function decrementarDelCarrito(accessToken, peliculaId) {
  if (!peliculaId) {
    throw createApiError({
      code: "VALIDATION_PELICULA_ID_REQUIRED",
      details: { field: "peliculaId" }
    });
  }

  const url = `${API_BASE}/carrito/items/${encodeURIComponent(peliculaId)}/decrement`;

  try {
    const res = await fetch(url, {
      method: "PATCH",
      headers: buildAuthHeaders(accessToken)
    });

    if (!res.ok) {
      await parseErrorResponse(res);
    }

    const json = await res.json();
    return mapCarritoDTOtoUI(json);
  } catch (error) {
    throw normalizeApiError(error, { fallbackCode: "UNKNOWN_ERROR" });
  }
}
