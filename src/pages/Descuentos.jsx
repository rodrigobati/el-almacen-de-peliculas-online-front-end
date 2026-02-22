import { useState, useEffect } from "react";
import { obtenerCupones } from "../api/descuentos";
import { DescuentosCard } from "../components/DescuentosCard";

export const Descuentos = () => {
  const [cupones, setCupones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarCupones();
  }, []);

  const cargarCupones = async () => {
    try {
      setCargando(true);
      setError(null);
      const datos = await obtenerCupones();
      setCupones(datos);
    } catch (err) {
      setError("Error al cargar los descuentos");
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
            <DescuentosCard key={cupon.id} cupon={cupon} />
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
