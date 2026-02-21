export const DescuentoCard = ({ cupon }) => {
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
    <div className="descuento-card">
      <div className={`descuento-header ${esActivo() ? "activo" : "inactivo"}`}>
        <h3>{cupon.nombre}</h3>
        <span
          className={`badge ${esActivo() ? "badge-activo" : "badge-inactivo"}`}
        >
          {esActivo() ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="descuento-body">
        {cupon.porcentaje && (
          <div className="descuento">
            <span className="descuento-valor">{cupon.porcentaje}%</span>
            <span className="descuento-texto">de descuento</span>
          </div>
        )}

        {cupon.monto && (
          <div className="descuento">
            <span className="descuento-valor">${cupon.monto}</span>
            <span className="descuento-texto">de descuento</span>
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

      <div className="descuento-footer">
        <button className="btn-copiar" onClick={copiarCodigo}>
          Copiar código
        </button>
      </div>
    </div>
  );
};
