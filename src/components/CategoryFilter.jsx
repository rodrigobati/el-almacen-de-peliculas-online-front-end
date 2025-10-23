// src/components/CategoryFilter.jsx
import React from "react";

export default function CategoryFilter({ categories = [], value, onChange }) {
  return (
    <div className="categories" role="tablist" aria-label="Filtrar por categoría" style={{ display:"flex", gap:8, flexWrap:"wrap", margin:"12px 0" }}>
      <button
        role="tab"
        aria-selected={value == null}
        onClick={() => onChange?.(undefined)}
        className={!value ? "active" : ""}
        style={btnStyle(!value)}
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
          style={btnStyle(value === c.id)}
          title={c.titulo}
        >
          {c.titulo}
        </button>
      ))}
    </div>
  );
}

function btnStyle(active){
  return {
    padding:"6px 10px",
    borderRadius:10,
    border:"1px solid var(--border)",
    background: active ? "#1a1d22" : "transparent",
    color:"var(--text)",
    cursor:"pointer"
  };
}
