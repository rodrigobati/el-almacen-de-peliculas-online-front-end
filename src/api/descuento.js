import { API_BASE } from './config';
import { createApiError } from './errorNormalizer';

export const obtenerCupones = async (accessToken) => {
  if (!accessToken) {
    throw createApiError({ code: 'AUTH_TOKEN_MISSING', httpStatus: 401, rawMessage: 'Access token missing' });
  }

  const url = `${API_BASE}/admin/descuentos/listar`;

  let res;
  try {
    res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (err) {
    throw createApiError({ code: 'NETWORK_ERROR', rawMessage: String(err?.message), cause: err });
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch (e) {
      payload = null;
    }
    throw createApiError({ code: payload?.code || `HTTP_${res.status}`, httpStatus: res.status, rawMessage: payload?.message || text });
  }

  return res.json();
};
