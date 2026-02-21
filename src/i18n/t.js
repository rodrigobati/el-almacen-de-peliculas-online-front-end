import esAR from "./esAR";

function resolveKey(dictionary, key) {
  return key.split(".").reduce((current, segment) => {
    if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
      return current[segment];
    }
    return undefined;
  }, dictionary);
}

function interpolate(template, params = {}) {
  return Object.entries(params).reduce((result, [paramKey, value]) => {
    const regex = new RegExp(`{{\\s*${paramKey}\\s*}}`, "g");
    return result.replace(regex, String(value));
  }, template);
}

export function t(key, params = {}) {
  const resolved = resolveKey(esAR, key);
  if (typeof resolved !== "string") {
    return key;
  }
  return interpolate(resolved, params);
}

export function purchaseStatusLabel(status) {
  if (!status) {
    return t("purchaseStatus.DESCONOCIDO");
  }
  return t(`purchaseStatus.${status}`);
}

export function rejectionMessageByCode(code) {
  if (!code) {
    return t("purchaseRejection.DEFAULT");
  }
  const mapped = t(`purchaseRejection.${code}`);
  if (mapped === `purchaseRejection.${code}`) {
    return t("purchaseRejection.DEFAULT");
  }
  return mapped;
}

export function apiErrorMessageKey(code, httpStatus) {
  const normalizedCode = typeof code === "string" ? code.toUpperCase() : "";

  if (normalizedCode.startsWith("HTTP_5")) {
    return "common.error.server";
  }

  if (normalizedCode === "HTTP_401" || normalizedCode === "AUTH_TOKEN_MISSING") {
    return "common.error.unauthorized";
  }

  if (normalizedCode === "HTTP_403") {
    return "common.error.forbidden";
  }

  if (normalizedCode === "NETWORK_ERROR") {
    return "common.error.network";
  }

  if (normalizedCode === "CARRITO_VACIO") {
    return "sales.error.CARRITO_VACIO";
  }

  if (normalizedCode === "DESCUENTO_INVALIDO") {
    return "sales.error.DESCUENTO_INVALIDO";
  }

  if (normalizedCode === "COMPRA_NO_ENCONTRADA") {
    return "sales.error.COMPRA_NO_ENCONTRADA";
  }

  if (normalizedCode === "CLIENTE_NO_AUTENTICADO") {
    return "sales.error.CLIENTE_NO_AUTENTICADO";
  }

  if (normalizedCode === "STOCK_INSUFICIENTE") {
    return "sales.error.STOCK_INSUFICIENTE";
  }

  if (normalizedCode.startsWith("VALIDATION_")) {
    return "common.error.validation";
  }

  if (typeof httpStatus === "number") {
    if (httpStatus >= 500) {
      return "common.error.server";
    }
    if (httpStatus === 401) {
      return "common.error.unauthorized";
    }
    if (httpStatus === 403) {
      return "common.error.forbidden";
    }
  }

  return "common.error.generic";
}
