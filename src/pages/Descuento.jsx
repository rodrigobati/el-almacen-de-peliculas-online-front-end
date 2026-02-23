import { useState, useEffect } from "react";
import { obtenerCupones } from "../api/descuento";
import { DescuentoCard } from "../components/DescuentoCard";
import { useAuth } from "../contexts/AuthContext";

export const Descuentos = () => {
  const [cupones, setCupones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const { token, authInitialized } = useAuth();

  useEffect(() => {
    // Wait until auth initialization completes and a token is available.
    if (!authInitialized) return;
    if (!token) return; // token missing -> do not attempt unauthenticated fetch
    cargarCupones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authInitialized]);

  const cargarCupones = async () => {
    try {
      setCargando(true);
      setError(null);
      if (import.meta.env?.DEV) {
        console.debug("[Descuentos] fetch start:", `${import.meta.env.VITE_API_BASE_URL || ''}/admin/descuentos/listar`);
      }
      const datos = await obtenerCupones(token);
      setCupones(datos);
    } catch (err) {
      // Distinguish authorization errors
      const status = err?.httpStatus || err?.status;
      if (status === 401 || status === 403) {
        setError("No autorizado");
      } else {
        setError("Error al cargar los descuentos");
      }
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  if (cargando) {
    return (
      <div className="descuentos-container">
        <p>Cargando descuentos...</p>
      </div>
    );
  }

  return (
    <div className="descuentos-container">
      <h1>Descuentos Disponibles</h1>

      {error && <div className="error-message">{error}</div>}

      {cupones.length > 0 ? (
        <div className="cupones-grid">
          {cupones.map((cupon) => (
            <DescuentoCard key={cupon.id} cupon={cupon} />
          ))}
        </div>
      ) : (
        <div className="sin-descuentos">
          No hay descuentos disponibles en este momento
        </div>
      )}
    </div>
  );
};
