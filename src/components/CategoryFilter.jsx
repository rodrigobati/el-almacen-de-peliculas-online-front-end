// src/components/CategoryFilter.jsx
import React from "react";

export default function CategoryFilter({ categories = [], value, onChange }) {
  return (
    <div
      className="category-filter"
      role="tablist"
      aria-label="Filtrar por categoría"
    >
      <button
        role="tab"
        aria-selected={value == null}
        onClick={() => onChange?.(undefined)}
        className={!value ? "active" : ""}
      >
        Todas
      </button>
      {categories.map((c) => (
        <button
          key={c.id}
          role="tab"
          aria-selected={value === c.id}
          onClick={() => onChange?.(c.id)}
          className={value === c.id ? "active" : ""}
          title={c.titulo}
        >
          {c.titulo}
        </button>
      ))}
    </div>
  );
}
