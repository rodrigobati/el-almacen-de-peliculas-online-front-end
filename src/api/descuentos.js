import { API_BASE } from './config';

export const obtenerCupones = async () => {
  try {
    console.log('Llamando a:', `${API_BASE}/descuentos/listar`); // Para debugging
    
    const response = await fetch(`${API_BASE}/descuentos/listar`);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validar que la respuesta sea un array
    if (!Array.isArray(data)) {
      throw new Error('La respuesta no es un array válido');
    }
    
    return data;
  } catch (error) {
    console.error('Error en obtenerCupones:', error);
    throw error;
  }
};