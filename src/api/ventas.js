const RAW_VENTAS_BASE =
  import.meta.env.VITE_VENTAS_API_BASE_URL || "http://localhost:9500";

const VENTAS_BASE = RAW_VENTAS_BASE.replace(/\/$/, "");

const ERROR_MESSAGES_BY_CODE = {
  CARRITO_VACIO: "Your cart is empty.",
  DESCUENTO_INVALIDO: "Invalid discount.",
  COMPRA_NO_ENCONTRADA: "Purchase not found.",
  CLIENTE_NO_AUTENTICADO: "You must sign in to continue.",
  AUTH_TOKEN_MISSING: "Authentication token is missing. Please sign in again."
};

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
  let code = null;

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
    code = payload.code || payload.errorCode || null;
    message = payload.message || payload.error || message;
  }

  const normalized = {
    status: res.status,
    code,
    message,
    raw: payload
  };

  throw normalized;
}

function mapFriendlyMessage(error) {
  if (!error) {
    return "Unexpected error.";
  }

  if (error.code && ERROR_MESSAGES_BY_CODE[error.code]) {
    return ERROR_MESSAGES_BY_CODE[error.code];
  }

  if (error.status === 0) {
    return "Could not connect to the sales service.";
  }

  return error.message || "Unexpected error.";
}

async function request(path, { method = "GET", token, body } = {}) {
  const url = `${VENTAS_BASE}${path}`;

  if (!token) {
    throw {
      status: 401,
      code: "AUTH_TOKEN_MISSING",
      message: ERROR_MESSAGES_BY_CODE.AUTH_TOKEN_MISSING,
      friendlyMessage: ERROR_MESSAGES_BY_CODE.AUTH_TOKEN_MISSING
    };
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
    if (error && Object.prototype.hasOwnProperty.call(error, "status")) {
      throw {
        ...error,
        friendlyMessage: mapFriendlyMessage(error)
      };
    }

    const networkError = {
      status: 0,
      code: "NETWORK_ERROR",
      message: error?.message || "Network error"
    };

    throw {
      ...networkError,
      friendlyMessage: mapFriendlyMessage(networkError)
    };
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
  return {
    items: Array.isArray(dto.items) ? dto.items.map(mapCarritoItem) : [],
    subtotal: asNumber(dto.subtotal),
    descuentoAplicado: asNumber(dto.descuentoAplicado),
    total: asNumber(dto.totalFinal)
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

export function getVentasFriendlyMessage(error) {
  return mapFriendlyMessage(error);
}
