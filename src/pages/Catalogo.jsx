import React, { useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";

// Datos de ejemplo (local)
const products = [
  { id: 1, name: "Los Vengadores", price: 19999, rating: 5, image: "https://picsum.photos/seed/p1/640/640" },
  { id: 2, name: "Inception", price: 25999, rating: 4, image: "https://picsum.photos/seed/p2/640/640" },
  { id: 3, name: "Interstellar", price: 9999, rating: 4, image: "https://picsum.photos/seed/p3/640/640" },
  { id: 4, name: "Parasite", price: 14999, rating: 5, image: "https://picsum.photos/seed/p4/640/640" },
  { id: 5, name: "La La Land", price: 32999, rating: 3, image: "https://picsum.photos/seed/p5/640/640" },
  { id: 6, name: "The Matrix", price: 45999, rating: 5, image: "https://picsum.photos/seed/p6/640/640" },
];


export default function CatalogPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header style={{ padding: 12, borderBottom: "1px solid #e5e7eb", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 12, alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>Catálogo</h2>
          <div style={{ flex: 1 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar películas..."
              style={{ width: "100%", padding: "8px 12px", borderRadius: 999, border: "1px solid #e5e7eb" }}
            />
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "18px auto", padding: "0 12px" }}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      </main>

      {/* Modal simple */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            zIndex: 60,
          }}
          onClick={() => setSelected(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 12, maxWidth: 720, width: "100%", padding: 18 }}
          >
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 220, flex: "0 0 220px" }}>
                <img src={selected.image} alt={selected.name} style={{ width: "100%", borderRadius: 8 }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0 }}>{selected.name}</h3>
                <p style={{ fontWeight: 700 }}>Precio: $ {Number(selected.price).toLocaleString("es-AR")}</p>
                <div style={{ marginTop: 8 }}>
                  <strong>Rating:</strong> {selected.rating} / 5
                </div>
                <p style={{ marginTop: 12 }}>Descripción de ejemplo: una gran película para ver en familia.</p>
                <div style={{ marginTop: 16 }}>
                  <button onClick={() => setSelected(null)} style={{ padding: "8px 12px", borderRadius: 8 }}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
