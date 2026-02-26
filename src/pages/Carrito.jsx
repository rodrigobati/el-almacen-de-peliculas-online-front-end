// src/pages/Carrito.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { eliminarDelCarrito, decrementarDelCarrito } from "../api/carrito";
import { confirmarCompra, getCarrito } from "../api/ventas";
import { validarDescuento } from "../api/descuentos";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import { apiErrorMessageKey, t } from "../i18n/t";

function resolveErrorMessage(error) {
  const key = apiErrorMessageKey(error?.code, error?.httpStatus);
  return t(key, error?.details ?? {});
}

export default function Carrito() {
  const { keycloak, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({
    open: false,
    title: "",
    description: "",
    variant: "success",
  });
  const [confirmState, setConfirmState] = useState({
    open: false,
    peliculaId: null,
    titulo: "",
  });
  const [confirmCompraOpen, setConfirmCompraOpen] = useState(false);
  const [confirmandoCompra, setConfirmandoCompra] = useState(false);
  const [clienteId, setClienteId] = useState("");
  const [nombreDescuento, setNombreDescuento] = useState("");
  const [descuentoAplicado, setDescuentoAplicado] = useState(null);
  const [validandoDescuento, setValidandoDescuento] = useState(false);

  const accessToken = token;

  useEffect(() => {
    try {
      setClienteId(localStorage.getItem("clienteId") || "");
    } catch {
      setClienteId("");
    }
  }, []);

  useEffect(() => {
    loadCarrito();
  }, [accessToken, clienteId]);

  async function loadCarrito() {
    try {
      setLoading(true);
      setError(null);
      const data = await getCarrito(accessToken);
      setCarrito(data);
    } catch (err) {
      console.error("Error al cargar carrito:", err);
      setError(resolveErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleEliminar(peliculaId) {
    try {
      const data = await eliminarDelCarrito(accessToken, peliculaId);
      setCarrito(data);
      setToast({
        open: true,
        title: "Producto eliminado",
        description: "La película fue removida del carrito.",
        variant: "success",
      });
    } catch (err) {
      console.error("Error al eliminar:", err);
      setToast({
        open: true,
        title: "No se pudo eliminar",
        description: resolveErrorMessage(err),
        variant: "error",
      });
    }
  }
  async function handleAplicarDescuento() {
    if (!nombreDescuento.trim()) {
      setToast({
        open: true,
        title: "Campo vacío",
        description: "Ingresá el nombre o código del descuento",
        variant: "error",
      });
      return;
    }

    try {
      setValidandoDescuento(true);
      const cupon = await validarDescuento(nombreDescuento.trim(), accessToken);
      setDescuentoAplicado(cupon);
      setToast({
        open: true,
        title: "Descuento aplicado",
        description: `Se aplicó ${cupon.porcentaje}% de descuento`,
        variant: "success",
      });
    } catch (err) {
      console.error("Error al validar descuento:", err);
      setDescuentoAplicado(null);
      setToast({
        open: true,
        title: "Descuento inválido",
        description: "El código ingresado no es válido o está vencido",
        variant: "error",
      });
    } finally {
      setValidandoDescuento(false);
    }
  }

  function handleLimpiarDescuento() {
    setNombreDescuento("");
    setDescuentoAplicado(null);
  }

  function openConfirm(item) {
    setConfirmState({
      open: true,
      peliculaId: item.peliculaId,
      titulo: item.titulo,
    });
  }

  function closeConfirm() {
    setConfirmState({ open: false, peliculaId: null, titulo: "" });
  }

  async function handleConfirmEliminar() {
    const peliculaId = confirmState.peliculaId;
    closeConfirm();

    if (!peliculaId) {
      return;
    }

    await handleEliminar(peliculaId);
  }

  async function handleDecrementar(peliculaId) {
    try {
      const data = await decrementarDelCarrito(accessToken, peliculaId);
      setCarrito(data);
    } catch (err) {
      console.error("Error al decrementar:", err);
      setToast({
        open: true,
        title: "No se pudo decrementar",
        description: resolveErrorMessage(err),
        variant: "error",
      });
    }
  }

  function handleClienteIdChange(event) {
    const value = event.target.value;
    setClienteId(value);
    try {
      if (!value.trim()) {
        localStorage.removeItem("clienteId");
      } else {
        localStorage.setItem("clienteId", value.trim());
      }
    } catch {
      // noop
    }
  }

  function openConfirmCompra() {
    setConfirmCompraOpen(true);
  }

  function closeConfirmCompra() {
    if (confirmandoCompra) return;
    setConfirmCompraOpen(false);
  }

  async function handleConfirmCompra() {
    if (confirmandoCompra) return;
    try {
      setConfirmandoCompra(true);
      const cupon = nombreDescuento.trim();

      const response = await confirmarCompra(
        { nombreCupon: cupon.length ? cupon : null },
        accessToken,
      );
      setToast({
        open: true,
        title: "Compra confirmada",
        description: "Estamos validando stock. Te mostramos el detalle.",
        variant: "success",
      });
      setConfirmCompraOpen(false);
      navigate(`/compras/${response.compraId}`);
    } catch (err) {
      setToast({
        open: true,
        title: "No se pudo confirmar la compra",
        description: resolveErrorMessage(err),
        variant: "error",
      });
      setConfirmCompraOpen(false);
    } finally {
      setConfirmandoCompra(false);
    }
  }

  const header = (
    <div className="carrito-header">
      <h2>{t("cart.title")}</h2>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="btn-secondary"
      >
        {t("cart.backToCatalog")}
      </button>
      <Link to="/compras" className="btn-secondary">
        {t("cart.viewPurchases")}
      </Link>
    </div>
  );

  if (loading) {
    return (
      <div className="carrito-page">
        <div className="container">
          {header}
          <p className="loading-text">{t("cart.loading")}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && !accessToken) {
    return (
      <div className="carrito-page">
        <div className="container">
          {header}
          <div className="error-box">
            <p>{t("cart.authNoToken")}</p>
            <button
              onClick={() => keycloak?.login()}
              className="btn-primary"
              type="button"
            >
              {t("cart.authSignInAgain")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!accessToken && !clienteId.trim()) {
    return (
      <div className="carrito-page">
        <div className="container">
          {header}
          <div className="error-box">
            <p>{t("cart.authWithDevClient")}</p>
            <input
              type="text"
              value={clienteId}
              onChange={handleClienteIdChange}
              placeholder="cliente-dev-123"
              style={{
                width: "100%",
                marginBottom: "0.75rem",
                padding: "0.6rem",
              }}
            />
            <button
              onClick={() => keycloak?.login()}
              className="btn-primary"
              style={{ marginRight: "0.75rem" }}
            >
              Iniciar sesión
            </button>
            <button
              onClick={loadCarrito}
              className="btn-secondary"
              type="button"
            >
              {t("cart.retryWithClientId")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carrito-page">
        <div className="container">
          {header}
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
          {header}
          <div className="empty-cart">
            <p>{t("cart.empty")}</p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-primary"
            >
              {t("cart.goToCatalog")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotalResumen = Number(
    carrito.subtotal ??
      carrito.total ??
      carrito.items.reduce(
        (acumulado, item) =>
          acumulado +
          Number(
            item.subtotal ??
              Number(item.precioUnitario ?? 0) * Number(item.cantidad ?? 0),
          ),
        0,
      ),
  );

  const descuentoCalculado = descuentoAplicado
    ? (subtotalResumen * descuentoAplicado.porcentaje) / 100
    : 0;

  const totalResumen = subtotalResumen - descuentoCalculado;

  return (
    <div className="carrito-page">
      <div className="container">
        {header}

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
                  <div className="item-controls">
                    <button
                      onClick={() => handleDecrementar(item.peliculaId)}
                      className="btn-decrement"
                      title={t("cart.removeOneUnit")}
                    >
                      -
                    </button>
                    <button
                      onClick={() => openConfirm(item)}
                      className="btn-delete"
                      title={t("cart.remove")}
                    >
                      🗑️ {t("cart.remove")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="carrito-summary">
            <div className="summary-row">
              <span className="summary-label">{t("cart.summarySubtotal")}</span>
              <span>${subtotalResumen.toLocaleString()}</span>
            </div>
            <div
              className="summary-row"
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.35rem",
              }}
            >
              <span className="summary-label">Código de descuento</span>
              <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                <input
                  type="text"
                  value={nombreDescuento}
                  onChange={(event) => setNombreDescuento(event.target.value)}
                  placeholder="Ingresá el código"
                  disabled={validandoDescuento || descuentoAplicado}
                  style={{ flex: 1, padding: "0.6rem" }}
                />
                {!descuentoAplicado ? (
                  <button
                    type="button"
                    onClick={handleAplicarDescuento}
                    disabled={validandoDescuento || !nombreDescuento.trim()}
                    className="btn-secondary"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    {validandoDescuento ? "Validando..." : "Aplicar"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleLimpiarDescuento}
                    className="btn-secondary"
                    style={{ whiteSpace: "nowrap" }}
                  >
                    Quitar
                  </button>
                )}
              </div>
              {descuentoAplicado && (
                <span style={{ fontSize: "0.85rem", color: "#28a745" }}>
                  ✓ {descuentoAplicado.nombre} ({descuentoAplicado.porcentaje}%
                  OFF)
                </span>
              )}
            </div>

            <div className="summary-row">
              <span className="summary-label">{t("cart.summaryDiscount")}</span>
              <span
                style={{
                  color: descuentoCalculado > 0 ? "#28a745" : "inherit",
                }}
              >
                -${descuentoCalculado.toLocaleString()}
              </span>
            </div>
            <div className="summary-row">
              <span className="summary-label">{t("cart.summaryTotal")}</span>
              <span className="summary-total">
                ${totalResumen.toLocaleString()}
              </span>
            </div>
            <button
              type="button"
              onClick={openConfirmCompra}
              className="btn-primary"
              style={{ width: "100%", marginTop: "0.75rem" }}
            >
              {t("cart.confirmPurchase")}
            </button>
          </div>
        </div>
      </div>
      <Toast
        open={toast.open}
        title={toast.title}
        description={toast.description}
        variant={toast.variant}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
      <ConfirmModal
        open={confirmState.open}
        title="Eliminar producto"
        message={
          confirmState.titulo
            ? `¿Querés eliminar "${confirmState.titulo}" del carrito?`
            : "¿Querés eliminar esta película del carrito?"
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmEliminar}
        onCancel={closeConfirm}
      />
      <ConfirmModal
        open={confirmCompraOpen}
        title={t("cart.confirmPurchase")}
        message="¿Querés confirmar esta compra?"
        confirmLabel={
          confirmandoCompra
            ? t("cart.confirmingPurchase")
            : t("cart.confirmPurchase")
        }
        cancelLabel="Cancelar"
        onConfirm={handleConfirmCompra}
        onCancel={closeConfirmCompra}
      />
    </div>
  );
}
