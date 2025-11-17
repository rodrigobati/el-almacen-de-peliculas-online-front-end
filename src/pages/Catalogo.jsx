// src/pages/Catalogo.jsx
import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import CategoryFilter from "../components/CategoryFilter";
import { searchMovies, fetchCategories } from "../api/movies";
import Reviews from "../pages/Reviews";

export default function CatalogPage() {
  const [qRaw, setQRaw] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState();
  const [mostrarReviews, setMostrarReviews] = useState(false);

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0);
      setQuery(qRaw.trim());
    }, 300);
    return () => clearTimeout(t);
  }, [qRaw]);

  // Cargar categorías una vez
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const cats = await fetchCategories();
        if (!ignore) setCategories(cats);
      } catch (error) {
        console.warn("No se pudieron cargar las categorías:", error.message);
        // Usar categorías por defecto en caso de error
        if (!ignore) setCategories([]);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Cargar películas (query, page, size, categoryId)
  useEffect(() => {
    let ignore = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        // Temporalmente no enviamos categoryId al backend hasta que se arregle
        const data = await searchMovies({ q: query, page, size });
        if (!ignore) {
          let filteredItems = data.items || [];

          // Filtro temporal del lado del cliente hasta que se arregle el backend
          if (categoryId) {
            filteredItems = filteredItems.filter(
              (item) => item.genero === categoryId
            );
          }

          setItems(filteredItems);
          setTotal(filteredItems.length);
        }
      } catch (e) {
        if (!ignore) setError(String(e));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [query, page, size, categoryId]);

  const pages = Math.max(1, Math.ceil(total / size));

  return (
    <div>
      <header className="topbar">
        <div className="container row">
          <h2>Catálogo</h2>
          <div className="grow">
            <input
              value={qRaw}
              onChange={(e) => setQRaw(e.target.value)}
              placeholder="Buscar películas..."
              className="search"
              aria-label="Buscar películas"
            />
          </div>
        </div>
      </header>

      <main className="container">
        {/* Filtro de categorías */}
        <CategoryFilter
          categories={categories}
          value={categoryId}
          onChange={(id) => {
            setPage(0);
            setCategoryId(id);
          }}
        />

        {/* Indicador de filtro activo y resultados */}
        {!loading && !error && (
          <div
            style={{
              marginBottom: "1.5rem",
              padding: "1rem",
              background: "var(--card)",
              borderRadius: "0.5rem",
              border: "1px solid var(--border)",
            }}
          >
            {categoryId ? (
              <p style={{ margin: 0, color: "var(--accent)" }}>
                🎬 Mostrando <strong>{total}</strong> películas de{" "}
                <strong>"{categoryId}"</strong>
              </p>
            ) : (
              <p style={{ margin: 0, color: "var(--text-muted)" }}>
                🎬 Mostrando <strong>{total}</strong> películas en total
              </p>
            )}
          </div>
        )}

        {loading && <p className="muted">Cargando…</p>}
        {error && <p className="error">Error: {error}</p>}

        {!loading && !error && (
          <>
            <div className="grid">
              {items.map((it, idx) => (
                <ProductCard
                  key={idx}
                  item={it}
                  onOpen={() => setSelected(it)}
                />
              ))}
            </div>

            <div className="pager">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Anterior
              </button>
              <span>
                Página {page + 1} de {pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                disabled={page >= pages - 1}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </main>

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-grid">
              <img
                className="sheet-img"
                src={selected.imagenUrl}
                alt={selected.titulo}
              />
              <div className="sheet-body">
                <h3 className="sheet-title">{selected.titulo}</h3>
                <p className="muted">
                  {selected.genero} · {selected.formato} · {selected.condicion}
                </p>
                <p>
                  <strong>Precio:</strong> ${selected.precio?.toLocaleString()}
                </p>
                <p>
                  <strong>Directores:</strong> {selected.directores?.join(", ")}
                </p>
                <p>
                  <strong>Actores:</strong> {selected.actores?.join(", ")}
                </p>
                <p>
                  <strong>Fecha de salida:</strong> {selected.fechaSalida}
                </p>
                {selected.sinopsis && (
                  <p style={{ marginTop: 8 }}>{selected.sinopsis}</p>
                )}

                <div style={{ marginTop: 8, display: "flex", gap: "1rem" }}>
                  <button
                    onClick={() => setMostrarReviews(!mostrarReviews)}
                    className="btn-reviews"
                  >
                    {mostrarReviews ? "Ocultar Reviews" : "Ver Reviews"}
                  </button>
                  <button onClick={() => setSelected(null)} className="btn">
                    Cerrar
                  </button>
                </div>

                {/* Componente Reviews */}
                {mostrarReviews && (
                  <Reviews
                    peliculaId={selected.id}
                    peliculaTitulo={selected.titulo}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
