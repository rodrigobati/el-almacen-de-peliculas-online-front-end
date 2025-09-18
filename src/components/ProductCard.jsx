// src/components/ProductCard.jsx
import React from "react";

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
  return (
    <div className="stars" aria-label={`${value} de 5 estrellas`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} filled={i < value} />
      ))}
    </div>
  );
}

export default function ProductCard({ product, onClick }) {
  const { name, price, rating = 0, image } = product;

  return (
    <div
      className="product-card"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') onClick();
      }}
    >
      <div className="product-img-wrap">
        <img src={image} alt={name} className="product-img" loading="lazy" />
      </div>

      <div className="product-info">
        <div className="product-name" title={name}>
          {name}
        </div>

        <div className="product-meta">
          <Stars value={rating} />
          <div className="product-price">
            Precio $ {Number(price).toLocaleString("es-AR")}
          </div>
        </div>
      </div>
    </div>
  );
}
