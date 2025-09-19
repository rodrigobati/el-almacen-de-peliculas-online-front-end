// src/components/ProductCard.jsx
import React from "react";

function Star({ filled = false }) {
  return (
    <svg viewBox="0 0 24 24" className={`star ${filled ? "filled" : ""}`} aria-hidden="true">
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
  const title = item.titulo ?? item.name ?? "Sin título";
  const image = item.imagenUrl ?? item.image ?? "https://picsum.photos/seed/fallback/640/640";
  const price = item.precio ?? item.price ?? 0;
  const rating = item.rating ?? 0;

  return (
    <article className="card" onClick={onOpen} role="button" tabIndex={0}
      onKeyDown={(e)=> (e.key==='Enter'||e.key===' ') && onOpen()}>
      <div className="image">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="content">
        <h3 className="title">{title}</h3>
        <div className="meta">
          <span className="price">${price.toLocaleString()}</span>
          <Stars value={rating} />
        </div>
      </div>
    </article>
  );
}
