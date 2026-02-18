import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCompras } from "../api/ventas";
import { useAuth } from "../contexts/AuthContext";

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
        setError(err.message || "Could not load purchases.");
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
      return <p className="loading-text">Loading purchases...</p>;
    }

    if (error) {
      return <div className="error-box"><p>{error}</p></div>;
    }

    if (!compras.length) {
      return <p className="empty-cart">No purchases yet.</p>;
    }

    return (
      <div className="carrito-items">
        {compras.map((compra) => (
          <article key={compra.id} className="carrito-item">
            <div>
              <h3>Purchase #{compra.id}</h3>
              <p>Status: {compra.estado}</p>
              <p>Date: {formatDate(compra.fecha)}</p>
              <p>Total: {formatMoney(compra.total)}</p>
            </div>
            <Link className="btn-secondary" to={`/compras/${compra.id}`}>
              View detail
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
          <h2>My purchases</h2>
          <Link className="btn-secondary" to="/carrito">
            Go to cart
          </Link>
        </div>
        {content}
      </div>
    </div>
  );
}
