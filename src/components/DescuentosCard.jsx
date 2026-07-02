export const DescuentosCard = ({ cupon }) => {
  const esActivo = () => {
    const hoy = new Date();
    const inicio = new Date(cupon.fechaInicio);
    const fin = new Date(cupon.fechaFin);
    return hoy >= inicio && hoy <= fin;
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(cupon.nombre);
    alert("Código copiado al portapapeles");
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR");
  };

  return (
    <div className="descuentos-card">
      <div
        className={`descuentos-header ${esActivo() ? "activo" : "inactivo"}`}
      >
        <h3>{cupon.nombre}</h3>
        <span
          className={`badge ${esActivo() ? "badge-activo" : "badge-inactivo"}`}
        >
          {esActivo() ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="descuentos-body">
        {cupon.porcentaje !== null && cupon.porcentaje !== undefined && (
          <div className="descuentos">
            <span className="descuentos-valor">{cupon.porcentaje}%</span>
            <span className="descuentos-texto"> de descuento</span>
          </div>
        )}

        <div className="fechas">
          <p>
            <strong>Válido desde:</strong> {formatearFecha(cupon.fechaInicio)}
          </p>
          <p>
            <strong>Válido hasta:</strong> {formatearFecha(cupon.fechaFin)}
          </p>
        </div>
      </div>

      <div className="descuentos-footer">
        <button className="btn-copiar" onClick={copiarCodigo}>
          Copiar código
        </button>
      </div>
    </div>
  );
};
