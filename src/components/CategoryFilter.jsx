// src/components/CategoryFilter.jsx
import React from "react";

export default function CategoryFilter({ categories = [], value, onChange }) {
  // Crear un array completo con "Todas" como primer elemento
  const allOptions = [{ id: null, titulo: "Todas" }, ...categories];

  return (
    <div
      className="category-filter"
      role="tablist"
      aria-label="Filtrar por categoría"
    >
      {allOptions.map((option, index) => (
        <button
          key={
            option.id === null
              ? "all-categories"
              : option.id
              ? `category-${option.id}`
              : `category-index-${index}`
          }
          role="tab"
          aria-selected={value === option.id}
          onClick={() => onChange?.(option.id)}
          className={value === option.id ? "active" : ""}
          title={option.titulo}
        >
          {option.titulo}
        </button>
      ))}
    </div>
  );
}
