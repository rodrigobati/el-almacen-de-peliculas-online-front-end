import { API_BASE } from './config';

export const obtenerCupones = async (accessToken) => {
  try {
    const headers = {};
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const response = await fetch(`${API_BASE}/descuentos/listar`, {
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('La respuesta no es un array válido');
    }
    
    return data;
  } catch (error) {
    console.error('Error en obtenerCupones:', error);
    throw error;
  }
};

export const crearCupon = async (cuponData, accessToken) => {
  try {
    if (!accessToken) {
      throw new Error('Token de acceso requerido para crear un cupón');
    }
    
    const response = await fetch(`${API_BASE}/descuentos/crear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(cuponData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status}: ${errorText || response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en crearCupon:', error);
    throw error;
  }
};