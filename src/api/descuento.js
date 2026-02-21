import { API_BASE } from './config';

export const obtenerCupones = async () => {
  const response = await fetch(`${API_BASE}/descuentos/listar`);
  if (!response.ok) {
    throw new Error('Error al obtener cupones');
  }
  return response.json();
};
