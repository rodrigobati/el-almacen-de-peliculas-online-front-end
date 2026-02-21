import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCompras } from "../api/ventas";
import { useAuth } from "../contexts/AuthContext";
import { apiErrorMessageKey, purchaseStatusLabel, t } from "../i18n/t";

function formatDate(dateValue) {
  if (!dateValue) return "-";
  try {
    return new Date(dateValue).toLocaleString();
  } catch {
    return dateValue;
  }
}

function formatMoney(value) {
  if (typeof value !== "number") return "-";
  return `$${value.toFixed(2)}`;
}

export default function Compras() {
  const { token } = useAuth();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCompras() {
      setLoading(true);
      setError("");
      try {
        const data = await getCompras(token);
        if (!mounted) return;
        setCompras(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!mounted) return;
        setError(t(apiErrorMessageKey(err?.code, err?.httpStatus), err?.details ?? {}));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadCompras();
    return () => {
      mounted = false;
    };
  }, [token]);

  const content = useMemo(() => {
    if (loading) {
      return <p className="loading-text">{t("purchases.loading")}</p>;
    }

    if (error) {
      return <div className="error-box"><p>{error}</p></div>;
    }

    if (!compras.length) {
      return <p className="empty-cart">{t("purchases.empty")}</p>;
    }

    return (
      <div className="carrito-items">
        {compras.map((compra) => (
          <article key={compra.id} className="carrito-item">
            <div>
              <h3>{t("purchases.purchaseTitle", { id: compra.id })}</h3>
              <p>{t("purchases.statusLabel")}: {purchaseStatusLabel(compra.estado)}</p>
              <p>{t("purchases.dateLabel")}: {formatDate(compra.fecha)}</p>
              <p>{t("purchases.totalLabel")}: {formatMoney(compra.total)}</p>
            </div>
            <Link className="btn-secondary" to={`/compras/${compra.id}`}>
              {t("purchases.viewDetail")}
            </Link>
          </article>
        ))}
      </div>
    );
  }, [compras, error, loading]);

  return (
    <div className="carrito-page">
      <div className="container">
        <div className="carrito-header">
          <h2>{t("purchases.title")}</h2>
          <Link className="btn-secondary" to="/carrito">
            {t("purchases.goToCart")}
          </Link>
        </div>
        {content}
      </div>
    </div>
  );
}
