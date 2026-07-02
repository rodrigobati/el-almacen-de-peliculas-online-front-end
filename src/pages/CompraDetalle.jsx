import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import useCompraStatus from "../hooks/useCompraStatus";
import {
  apiErrorMessageKey,
  purchaseStatusClass,
  purchaseStatusLabel,
  rejectionMessageByCode,
  t
} from "../i18n/t";

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
          <h2>{t("purchaseDetail.pageTitle")}</h2>
          <p className="loading-text">{t("purchaseDetail.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carrito-page">
        <div className="container">
          <h2>{t("purchaseDetail.pageTitle")}</h2>
          <div className="error-box">
            <p>{t(apiErrorMessageKey(error?.code, error?.httpStatus), error?.details ?? {})}</p>
          </div>
          <Link className="btn-secondary" to="/compras">
            {t("purchaseDetail.backToPurchases")}
          </Link>
        </div>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className="carrito-page">
        <div className="container">
          <h2>{t("purchaseDetail.pageTitle")}</h2>
          <div className="error-box">
            <p>{t("purchaseDetail.notFound")}</p>
          </div>
          <Link className="btn-secondary" to="/compras">
            {t("purchaseDetail.backToPurchases")}
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
          <h2>{t("purchaseDetail.purchaseTitle", { id: compra.id })}</h2>
          <Link className="btn-secondary" to="/compras">
            {t("purchaseDetail.backToPurchases")}
          </Link>
        </div>

        {isRejected && (
          <div className="purchase-rejection-message" role="status">
            <div className="purchase-rejection-icon" aria-hidden="true">!</div>
            <div>
              <h3>{t("purchaseDetail.rejectedTitle")}</h3>
              <p>{rejectionMessageByCode(compra.motivoRechazo)}</p>
              <p className="purchase-rejection-help">{t("purchaseDetail.rejectedHelp")}</p>
            </div>
          </div>
        )}
        {!isRejected && isPolling && (
          <div className="purchase-progress-message" role="status" aria-live="polite">
            <span className="purchase-progress-spinner" aria-hidden="true" />
            <span>{t("purchaseDetail.validatingStock")}</span>
          </div>
        )}

        <section className="carrito-summary" style={{ marginBottom: "1rem" }}>
          <p className="purchase-status-row">
            <span>{t("purchaseDetail.statusLabel")}:</span>
            <span className={purchaseStatusClass(compra.estado)}>
              {purchaseStatusLabel(compra.estado)}
            </span>
          </p>
          <p>{t("purchaseDetail.dateLabel")}: {formatDate(compra.fecha)}</p>
          <p>{t("purchaseDetail.subtotalLabel")}: {formatMoney(compra.subtotal)}</p>
          <p>{t("purchaseDetail.discountLabel")}: {formatMoney(compra.descuentoAplicado)}</p>
          <p>{t("purchaseDetail.totalLabel")}: {formatMoney(compra.total)}</p>
        </section>

        <section>
          <h3>{t("purchaseDetail.itemsTitle")}</h3>
          {!compra.items?.length ? (
            <p>{t("purchaseDetail.emptyItems")}</p>
          ) : (
            <div className="carrito-items">
              {compra.items.map((item, index) => (
                <div className="carrito-item" key={`${item.peliculaId}-${index}`}>
                  <div className="item-info">
                    <h4 className="item-titulo">{item.titulo || t("purchaseDetail.itemFallbackTitle", { id: item.peliculaId })}</h4>
                    <div className="item-details">
                      <span className="item-precio">{t("purchaseDetail.qtyLabel", { value: item.cantidad })}</span>
                      <span className="item-precio">{t("purchaseDetail.unitPriceLabel", { value: formatMoney(item.precioUnitario) })}</span>
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
            {t("purchaseDetail.goToCart")}
          </Link>
        </div>
      </div>
    </div>
  );
}
