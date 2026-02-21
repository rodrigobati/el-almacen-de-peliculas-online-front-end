import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { t } from "../i18n/t";

function ReviewStar({
  filled = false,
  size = "normal",
  interactive = false,
  onClick,
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`review-star ${size} ${filled ? "filled" : ""} ${
        interactive ? "interactive" : ""
      }`}
      aria-hidden="true"
      onClick={interactive ? onClick : undefined}
    >
      <path d="M12 2.25l2.95 5.98 6.6.96-4.78 4.66 1.13 6.59L12 17.77l-5.9 3.12 1.13-6.59L2.46 9.19l6.6-.96L12 2.25z" />
    </svg>
  );
}

function ReviewStars({
  value = 0,
  size = "normal",
  interactive = false,
  onChange,
}) {
  return (
    <div className="review-stars">
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1;
        return (
          <ReviewStar
            key={idx}
            size={size}
            filled={idx <= value}
            interactive={interactive}
            onClick={interactive ? () => onChange?.(idx) : undefined}
          />
        );
      })}
    </div>
  );
}

export default function Reviews({ peliculaId, peliculaTitulo }) {
  const { isAuthenticated, user, keycloak } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [nuevaReview, setNuevaReview] = useState({
    puntuacion: 5,
    comentario: "",
  });
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (peliculaId) cargarReviews();
  }, [peliculaId]);

  const cargarReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:9500/api/ratings/pelicula/${peliculaId}`
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error cargando reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const enviarReview = async () => {
    if (!nuevaReview.comentario.trim() || !isAuthenticated) return;

    setEnviando(true);
    try {
      // Obtener el token y el username de Keycloak
      const token = keycloak?.token;
      const usuarioId = user?.preferred_username || user?.sub || "anonymous";
      
      console.log("Usuario autenticado:", user); // Para debugging
      console.log("UsuarioId a enviar:", usuarioId);
      
      const response = await fetch(
        `http://localhost:9500/api/ratings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({
            peliculaId: peliculaId,
            valor: nuevaReview.puntuacion,
            comentario: nuevaReview.comentario.trim(),
            usuarioId: usuarioId,
          }),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("✅ Review enviada exitosamente:", responseData);
        setNuevaReview({ puntuacion: 5, comentario: "" });
        setMostrarForm(false);
        await cargarReviews();
      } else {
        const errorData = await response.text();
        console.error("❌ Error del servidor:", errorData);
        alert(t("reviews.sendError"));
      }
    } catch (error) {
      console.error("❌ Error enviando review:", error);
      alert(t("reviews.sendError"));
    } finally {
      setEnviando(false);
    }
  };

  const formatearFecha = (fecha) => {
    try {
      return new Date(fecha).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return fecha;
    }
  };

  const promedio = reviews.length
    ? reviews.reduce((acc, r) => acc + (r.valor || 0), 0) / reviews.length
    : 0;

  // Verificar si el usuario ya dejó una review
  const usuarioActual = user?.preferred_username || user?.sub;
  const usuarioYaReseño = reviews.some(
    (review) => review.usuarioId === usuarioActual
  );

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h3>{t("reviews.title")}</h3>
        {reviews.length > 0 && (
          <div className="reviews-stats">
            <span className="promedio">{promedio.toFixed(1)}</span>
            <ReviewStars value={Math.round(promedio)} size="small" />
            <span className="total-reviews">{t("reviews.totalCount", { count: reviews.length })}</span>
          </div>
        )}
      </div>

      {isAuthenticated && !mostrarForm && !usuarioYaReseño && (
        <button
          onClick={() => setMostrarForm(true)}
          className="btn-agregar-review"
        >
          {t("reviews.write")}
        </button>
      )}

      {isAuthenticated && usuarioYaReseño && (
        <div className="ya-reseno-mensaje">
          <p>{t("reviews.alreadyReviewed")}</p>
        </div>
      )}

      {mostrarForm && isAuthenticated && (
        <div className="review-form">
          <h4>{t("reviews.yourReview")}</h4>

          <div className="form-field">
            <label>Puntuación:</label>
            <ReviewStars
              value={nuevaReview.puntuacion}
              size="large"
              interactive
              onChange={(puntuacion) =>
                setNuevaReview({ ...nuevaReview, puntuacion })
              }
            />
          </div>

          <div className="form-field">
            <label>Comentario:</label>
            <textarea
              value={nuevaReview.comentario}
              onChange={(e) =>
                setNuevaReview({ ...nuevaReview, comentario: e.target.value })
              }
              placeholder="Comparte tu opinión sobre esta película..."
              className="review-textarea"
              rows="4"
              maxLength="500"
            />
            <span className="char-count">
              {nuevaReview.comentario.length}/500
            </span>
          </div>

          <div className="form-actions">
            <button
              onClick={enviarReview}
              disabled={!nuevaReview.comentario.trim() || enviando}
              className="btn-enviar-review"
            >
              {enviando ? t("reviews.submitting") : t("reviews.submit")}
            </button>
            <button
              onClick={() => setMostrarForm(false)}
              className="btn-cancelar"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="login-prompt-small">
          <p>{t("reviews.loginToWrite")}</p>
        </div>
      )}

      <div className="reviews-lista">
        {loading && <p className="loading-text">{t("reviews.loading")}</p>}

        {!loading && reviews.length === 0 && (
          <div className="no-reviews">
            <p>{t("reviews.empty")}</p>
            <p>{t("reviews.beFirst")}</p>
          </div>
        )}

        {reviews.map((review, index) => (
          <div key={index} className="review-item">
            <div className="review-header-item">
              <div className="review-usuario-info">
                <span className="review-usuario">
                  👤 {review.usuarioId || t("reviews.anonymousUser")}
                </span>
                <span className="review-fecha">
                  {formatearFecha(review.fechaCreacion)}
                </span>
              </div>
              <ReviewStars value={review.valor} size="small" />
            </div>
            <div className="review-comentario">{review.comentario}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
