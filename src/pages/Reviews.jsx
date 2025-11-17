import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

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
  const { isAuthenticated, user } = useAuth();
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
        `http://localhost:8080/api/peliculas/${peliculaId}/reviews`
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
      const response = await fetch(
        `http://localhost:8080/api/peliculas/${peliculaId}/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Si usas Keycloak, mejor obtener el token del servicio, no del user
            // Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            puntuacion: nuevaReview.puntuacion,
            comentario: nuevaReview.comentario.trim(),
            usuario: user?.preferred_username || "Usuario",
          }),
        }
      );

      if (response.ok) {
        setNuevaReview({ puntuacion: 5, comentario: "" });
        setMostrarForm(false);
        await cargarReviews();
      } else {
        alert("Error al enviar la review");
      }
    } catch (error) {
      console.error("Error enviando review:", error);
      alert("Error al enviar la review");
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
    ? reviews.reduce((acc, r) => acc + (r.puntuacion || 0), 0) / reviews.length
    : 0;

  return (
    <div className="reviews-container">
      <div className="reviews-header">
        <h3>⭐ Reviews</h3>
        {reviews.length > 0 && (
          <div className="reviews-stats">
            <span className="promedio">{promedio.toFixed(1)}</span>
            <ReviewStars value={Math.round(promedio)} size="small" />
            <span className="total-reviews">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      {isAuthenticated && !mostrarForm && (
        <button
          onClick={() => setMostrarForm(true)}
          className="btn-agregar-review"
        >
          ✍️ Escribir una review
        </button>
      )}

      {mostrarForm && isAuthenticated && (
        <div className="review-form">
          <h4>Tu review</h4>

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
              {enviando ? "Enviando..." : "Publicar Review"}
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
          <p>Inicia sesión para escribir una review</p>
        </div>
      )}

      <div className="reviews-lista">
        {loading && <p className="loading-text">Cargando reviews...</p>}

        {!loading && reviews.length === 0 && (
          <div className="no-reviews">
            <p>Aún no hay reviews para esta película.</p>
            <p>¡Sé el primero en escribir una!</p>
          </div>
        )}

        {reviews.map((review, index) => (
          <div key={index} className="review-item">
            <div className="review-header-item">
              <div className="review-usuario-info">
                <span className="review-usuario">
                  👤 {review.usuario || "Usuario anónimo"}
                </span>
                <span className="review-fecha">
                  {formatearFecha(review.fecha)}
                </span>
              </div>
              <ReviewStars value={review.puntuacion} size="small" />
            </div>
            <div className="review-comentario">{review.comentario}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
