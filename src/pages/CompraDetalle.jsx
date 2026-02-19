import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useCompraStatus from "../hooks/useCompraStatus";

function formatMoney(value) {
  if (typeof value !== "number") return "-";
  return `$${value.toFixed(2)}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  try {
    return new Date(dateValue).toLocaleString();
  } catch {
    return dateValue;
  }
}

export default function CompraDetalle() {
  const { id } = useParams();
  const { token } = useAuth();

  const { compra, loading, error, isPolling } = useCompraStatus(id, token);

  if (loading) {
    return (
      <div className="carrito-page">
        <div className="container">
          <h2>Purchase detail</h2>
          <p className="loading-text">Loading purchase detail...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carrito-page">
        <div className="container">
          <h2>Purchase detail</h2>
          <div className="error-box">
            <p>{error.message || "Could not load purchase detail."}</p>
          </div>
          <Link className="btn-secondary" to="/compras">
            Back to purchases
          </Link>
        </div>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="carrito-page">
        <div className="container">
          <h2>Purchase detail</h2>
          <div className="error-box">
            <p>Purchase not found.</p>
          </div>
          <Link className="btn-secondary" to="/compras">
            Back to purchases
          </Link>
        </div>
      </div>
    );
  }

  const isRejected = compra.estado === "RECHAZADA";

  return (
    <div className="carrito-page">
      <div className="container">
        <div className="carrito-header">
          <h2>Purchase #{compra.id}</h2>
          <Link className="btn-secondary" to="/compras">
            Back to purchases
          </Link>
        </div>

        {isRejected && (
          <div className="error-box">
            <p>La compra fue rechazada por falta de stock. El importe fue reintegrado a tu billetera.</p>
            {compra.detallesRechazo && (
              <p style={{ fontSize: "0.9rem", opacity: 0.85 }}>
                <strong>Detalles técnicos:</strong> {compra.detallesRechazo}
              </p>
            )}
          </div>
        )}
        {!isRejected && isPolling && (
          <p className="loading-text">Validating stock status...</p>
        )}

        <section className="carrito-summary" style={{ marginBottom: "1rem" }}>
          <p>Status: {compra.estado}</p>
          <p>Date: {formatDate(compra.fecha)}</p>
          <p>Subtotal: {formatMoney(compra.subtotal)}</p>
          <p>Discount: {formatMoney(compra.descuentoAplicado)}</p>
          <p>Total: {formatMoney(compra.total)}</p>
        </section>

        <section>
          <h3>Items</h3>
          {!compra.items?.length ? (
            <p>No items found.</p>
          ) : (
            <div className="carrito-items">
              {compra.items.map((item, index) => (
                <div className="carrito-item" key={`${item.peliculaId}-${index}`}>
                  <div className="item-info">
                    <h4 className="item-titulo">{item.titulo || `Movie #${item.peliculaId}`}</h4>
                    <div className="item-details">
                      <span className="item-precio">Qty: {item.cantidad}</span>
                      <span className="item-precio">Unit: {formatMoney(item.precioUnitario)}</span>
                    </div>
                  </div>
                  <div className="item-subtotal">
                    <strong>{formatMoney(item.subtotal)}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div style={{ marginTop: "1rem", display: "flex", gap: "0.75rem" }}>
          <Link className="btn-secondary" to="/carrito">
            Go to cart
          </Link>
        </div>
      </div>
    </div>
  );
}
