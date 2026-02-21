function asObject(value) {
  return value && typeof value === "object" ? value : undefined;
}

function inferCode({ payload, httpStatus, fallbackCode }) {
  if (payload?.code) return String(payload.code);
  if (payload?.errorCode) return String(payload.errorCode);
  if (payload?.motivoRechazo) return String(payload.motivoRechazo);
  if (typeof httpStatus === "number") return `HTTP_${httpStatus}`;
  return fallbackCode;
}

export function createApiError({
  code,
  httpStatus,
  details,
  rawMessage,
  cause
}) {
  return {
    ok: false,
    code,
    ...(typeof httpStatus === "number" ? { httpStatus } : {}),
    ...(details !== undefined ? { details } : {}),
    ...(rawMessage ? { rawMessage: String(rawMessage) } : {}),
    ...(cause ? { cause } : {})
  };
}

export function normalizeApiError(error, { fallbackCode = "UNKNOWN_ERROR" } = {}) {
  if (error?.ok === false && typeof error?.code === "string") {
    return error;
  }

  const payload = asObject(error?.raw) || asObject(error?.details);
  const httpStatus =
    typeof error?.httpStatus === "number"
      ? error.httpStatus
      : typeof error?.status === "number"
        ? error.status
        : undefined;

  if (error?.name === "TypeError" && typeof httpStatus !== "number") {
    return createApiError({
      code: "NETWORK_ERROR",
      details: payload,
      rawMessage: error?.message,
      cause: error
    });
  }

  const code = inferCode({ payload, httpStatus, fallbackCode });

  return createApiError({
    code,
    httpStatus,
    details: payload,
    rawMessage: error?.message,
    cause: error
  });
}
