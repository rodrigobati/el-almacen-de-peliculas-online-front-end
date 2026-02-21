import { createApiError, normalizeApiError } from "./errorNormalizer";

const RAW_VENTAS_BASE =
  import.meta.env.VITE_VENTAS_API_BASE_URL || "http://localhost:9500";

const VENTAS_BASE = RAW_VENTAS_BASE.replace(/\/$/, "");

function getClienteIdFromStorage() {
  try {
    return localStorage.getItem("clienteId") || "";
  } catch {
    return "";
  }
}

export function buildHeaders({ token, method = "GET" } = {}) {
  const headers = {};
  const hasToken = Boolean(token);
  const clienteId = getClienteIdFromStorage();

  if (method.toUpperCase() === "POST") {
    headers["Content-Type"] = "application/json";
  }

  if (hasToken) {
    headers.Authorization = `Bearer ${token}`;
  }

  if ((import.meta.env.DEV || !hasToken) && clienteId) {
    headers["X-Cliente-Id"] = clienteId;
  }

  return headers;
}

export async function handleApiError(res) {
  let payload = null;
  let message = `HTTP ${res.status}`;

  try {
    const text = await res.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
      if (!payload) {
        message = text;
      }
    }
  } catch {
    payload = null;
  }

  if (payload) {
    message = payload.message || payload.error || message;
  }

  throw createApiError({
    code:
      payload?.code ||
      payload?.errorCode ||
      payload?.motivoRechazo ||
      `HTTP_${res.status}`,
    httpStatus: res.status,
    details: payload,
    rawMessage: message
  });
}

async function request(path, { method = "GET", token, body } = {}) {
  const url = `${VENTAS_BASE}${path}`;

  if (!token) {
    throw createApiError({
      code: "AUTH_TOKEN_MISSING",
      httpStatus: 401,
      details: { reason: "missing_token" }
    });
  }

  try {
    const response = await fetch(url, {
      method,
      headers: buildHeaders({ token, method }),
      body: body == null ? undefined : JSON.stringify(body)
    });

    if (!response.ok) {
      await handleApiError(response);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    throw normalizeApiError(error, { fallbackCode: "UNKNOWN_ERROR" });
  }
}

function asNumber(value) {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function mapCarritoItem(item = {}) {
  return {
    peliculaId: item.peliculaId || "",
    titulo: item.titulo || "",
    precioUnitario: asNumber(item.precioUnitario),
    cantidad: asNumber(item.cantidad),
    subtotal: asNumber(item.subtotal)
  };
}

function mapCarrito(dto = {}) {
  const items = Array.isArray(dto.items) ? dto.items.map(mapCarritoItem) : [];
  const subtotalDesdeItems = items.reduce(
    (acumulado, item) => acumulado + asNumber(item.subtotal),
    0
  );
  const subtotal = asNumber(dto.subtotal ?? dto.total ?? subtotalDesdeItems);
  const total = asNumber(dto.total ?? dto.totalFinal ?? subtotal);

  return {
    items,
    subtotal,
    descuentoAplicado: asNumber(dto.descuentoAplicado),
    total
  };
}

function mapCompraResumen(item = {}) {
  return {
    id: item.compraId,
    fecha: item.fechaHora,
    total: asNumber(item.totalFinal),
    estado: item.estado || ""
  };
}

function mapCompraItem(item = {}) {
  return {
    peliculaId: item.peliculaId,
    titulo: item.titulo,
    precioUnitario: asNumber(item.precioAlComprar),
    cantidad: asNumber(item.cantidad),
    subtotal: asNumber(item.subtotal)
  };
}

function mapCompraDetalle(dto = {}) {
  return {
    id: dto.compraId,
    fecha: dto.fechaHora,
    subtotal: asNumber(dto.subtotal),
    descuentoAplicado: asNumber(dto.descuentoAplicado),
    total: asNumber(dto.totalFinal),
    estado: dto.estado || "",
    motivoRechazo: dto.motivoRechazo || "",
    detallesRechazo: dto.detallesRechazo || "",
    items: Array.isArray(dto.items) ? dto.items.map(mapCompraItem) : []
  };
}

function mapConfirmacion(dto = {}) {
  return {
    compraId: dto.compraId,
    fecha: dto.fechaHora,
    total: asNumber(dto.totalFinal),
    estado: dto.estado || ""
  };
}

export function getCarrito(token) {
  return request("/api/carrito", { token }).then(mapCarrito);
}

export function confirmarCompra(payload = {}, token) {
  return request("/api/carrito/confirmar", {
    method: "POST",
    token,
    body: payload
  }).then(mapConfirmacion);
}

export function getCompras(token) {
  return request("/api/compras", { token }).then((data) =>
    Array.isArray(data) ? data.map(mapCompraResumen) : []
  );
}

export function getCompraDetalle(id, token) {
  return request(`/api/compras/${encodeURIComponent(id)}`, { token }).then(
    mapCompraDetalle
  );
}
