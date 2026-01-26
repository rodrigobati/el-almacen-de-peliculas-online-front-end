// src/pages/Carrito.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { fetchCarrito, eliminarDelCarrito } from "../api/carrito";

export default function Carrito() {
  const { user } = useAuth();
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clienteId = user?.preferred_username;

  useEffect(() => {
    if (!clienteId) {
      setLoading(false);
      setError("Usuario no identificado");
      return;
    }

    loadCarrito();
  }, [clienteId]);

  async function loadCarrito() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCarrito(clienteId);
      setCarrito(data);
    } catch (err) {
      console.error("Error al cargar carrito:", err);
      setError(err.message || "Error al cargar el carrito");
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(peliculaId) {
    if (!confirm("¿Eliminar esta película del carrito?")) {
      return;
    }

    try {
      const data = await eliminarDelCarrito(clienteId, peliculaId);
      setCarrito(data);
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert(err.message || "Error al eliminar la película");
    }
  }

  if (loading) {
    return (
      <div className="carrito-page">
        <div className="container">
          <h2>Mi Carrito</h2>
          <p className="loading-text">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carrito-page">
        <div className="container">
          <h2>Mi Carrito</h2>
          <div className="error-box">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (carrito.items.length === 0) {
    return (
      <div className="carrito-page">
        <div className="container">
          <h2>Mi Carrito</h2>
          <div className="empty-cart">
            <p>Tu carrito está vacío</p>
            <a href="/" className="btn-primary">Ir al catálogo</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-page">
      <div className="container">
        <h2>Mi Carrito</h2>

        <div className="carrito-content">
          <div className="carrito-items">
            {carrito.items.map((item) => (
              <div key={item.peliculaId} className="carrito-item">
                <div className="item-info">
                  <h3 className="item-titulo">{item.titulo}</h3>
                  <div className="item-details">
                    <span className="item-precio">
                      ${item.precioUnitario.toLocaleString()} x {item.cantidad}
                    </span>
                  </div>
                </div>
                <div className="item-actions">
                  <div className="item-subtotal">
                    <strong>${item.subtotal.toLocaleString()}</strong>
                  </div>
                  <button
                    onClick={() => handleEliminar(item.peliculaId)}
                    className="btn-delete"
                    title="Eliminar"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="carrito-summary">
            <div className="summary-row">
              <span className="summary-label">Total:</span>
              <span className="summary-total">${carrito.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
