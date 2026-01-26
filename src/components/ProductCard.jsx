// src/components/ProductCard.jsx
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { agregarAlCarrito } from "../api/carrito";

function Star({ filled = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`star ${filled ? "filled" : ""}`}
      aria-hidden="true"
    >
      <path d="M12 2.25l2.95 5.98 6.6.96-4.78 4.66 1.13 6.59L12 17.77l-5.9 3.12 1.13-6.59L2.46 9.19l6.6-.96L12 2.25z" />
    </svg>
  );
}

function Stars({ value = 0 }) {
  const arr = Array.from({ length: 5 });
  return (
    <div className="stars">
      {arr.map((_, i) => (
        <Star key={i} filled={i < value} />
      ))}
    </div>
  );
}

export default function ProductCard({ item, onOpen }) {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  
  const title = item.titulo ?? item.name ?? "Sin título";
  const image =
    item.imagenUrl ??
    item.image ??
    "https://picsum.photos/seed/fallback/640/640";
  const price = item.precio ?? item.price ?? 0;
  const rating = Math.round(item.ratingPromedio ?? item.rating ?? 0);

  async function handleAddToCart(e) {
    e.stopPropagation();
    
    if (!user?.preferred_username) {
      alert("Debes iniciar sesión para agregar al carrito");
      return;
    }

    try {
      setAdding(true);
      await agregarAlCarrito(user.preferred_username, {
        peliculaId: item.id,
        titulo: title,
        precio: price,
        cantidad: 1
      });
      alert("✅ Agregado al carrito");
    } catch (err) {
      console.error("Error al agregar al carrito:", err);
      alert(err.message || "Error al agregar al carrito");
    } finally {
      setAdding(false);
    }
  }

  return (
    <article
      className="product-card"
      role="button"
      tabIndex={0}
    >
      <div 
        className="product-img-wrap"
        onClick={onOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}
        role="button"
        tabIndex={0}
      >
        <img src={image} alt={title} className="product-img" loading="lazy" />
      </div>
      <div className="product-info">
        <h3 className="product-name" onClick={onOpen} style={{ cursor: "pointer" }}>
          {title}
        </h3>
        <div className="product-meta">
          <Stars value={rating} />
          <span className="product-price">${price.toLocaleString()}</span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={adding}
          className="btn-add-to-cart"
          title="Agregar al carrito"
        >
          {adding ? "Agregando..." : "🛒 Agregar al carrito"}
        </button>
      </div>
    </article>
  );
}
