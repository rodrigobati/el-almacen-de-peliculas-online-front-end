import React, { useEffect, useMemo, useState } from "react";
import ProductCard from "../components/ProductCard";
import { searchMovies } from "../api/movies";

export default function CatalogPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const data = await searchMovies({ q: query, page, size });
        if (!ignore) {
          setItems(data.items || []);
          setTotal(data.total ?? 0);
        }
      } catch (e) {
        if (!ignore) setError(String(e));
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => { ignore = true; };
  }, [query, page, size]);

  const pages = Math.max(1, Math.ceil(total / size));

  return (
    <div>
      <style>{styles}</style>

      <header className="topbar">
        <div className="container row">
          <h2>Catálogo</h2>
          <div className="grow">
            <input
              value={query}
              onChange={(e) => { setPage(0); setQuery(e.target.value); }}
              placeholder="Buscar películas..."
              className="search"
            />
          </div>
        </div>
      </header>

      <main className="container">
        {loading && <p className="muted">Cargando…</p>}
        {error && <p className="error">Error: {error}</p>}

        {!loading && !error && (
          <>
            <div className="grid">
              {items.map((it, idx) => (
                <ProductCard key={idx} item={it} onOpen={() => setSelected(it)} />
              ))}
            </div>

            <div className="pager">
              <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page===0}>Anterior</button>
              <span>Página {page+1} de {pages}</span>
              <button onClick={() => setPage(p => Math.min(pages-1, p+1))} disabled={page>=pages-1}>Siguiente</button>
            </div>
          </>
        )}
      </main>

      {selected && (
        <div className="modal" onClick={() => setSelected(null)}>
          <div className="sheet" onClick={(e)=>e.stopPropagation()}>
            <div className="sheet-grid">
              <img className="sheet-img" src={selected.imagenUrl} alt={selected.titulo} />
              <div className="sheet-body">
                <h3 className="sheet-title">{selected.titulo}</h3>
                <p className="muted">{selected.genero} · {selected.formato} · {selected.condicion}</p>
                <p><strong>Precio:</strong> ${selected.precio?.toLocaleString()}</p>
                <p><strong>Directores:</strong> {selected.directores?.join(", ")}</p>
                <p><strong>Actores:</strong> {selected.actores?.join(", ")}</p>
                <p><strong>Fecha de salida:</strong> {selected.fechaSalida}</p>
                {selected.sinopsis && (
                  <p style={{marginTop: 8}}>{selected.sinopsis}</p>
                )}
                <div style={{ marginTop: 16 }}>
                  <button onClick={() => setSelected(null)} className="btn">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = `
:root{ --bg:#0b0c0d; --card:#111317; --border:#22252b; --text:#e6e8eb; --muted:#8b90a1; }
*{ box-sizing:border-box; }
body{ margin:0; font-family:system-ui,Segoe UI,Roboto,Arial; background:var(--bg); color:var(--text); }
.container{ max-width:1100px; margin:0 auto; padding:16px; }
.row{ display:flex; gap:12px; align-items:center; }
.grow{ flex:1; }
.topbar{ border-bottom:1px solid var(--border); background:var(--bg); position:sticky; top:0; z-index:20; }
.search{ width:100%; padding:8px 12px; border-radius:10px; border:1px solid var(--border); background:#0b0c0d; color:var(--text); }
.grid{ display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:14px; }
.card{ background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; cursor:pointer; transition:transform .15s ease; }
.card:hover{ transform:translateY(-2px); }
.image img{ width:100%; height:280px; object-fit:cover; display:block; }
.content{ padding:12px; }
.title{ margin:0 0 6px; font-size:16px; line-height:1.2; }
.meta{ display:flex; align-items:center; justify-content:space-between; gap:8px; color:var(--muted); }
.price{ color:#9ad26d; font-weight:600; }
.stars{ display:flex; gap:3px; }
.star{ width:16px; height:16px; fill:none; stroke:#666; }
.star.filled{ fill:#f5c452; stroke:#f5c452; }
.muted{ color:var(--muted); }
.error{ color:#ff7a7a; }
.pager{ display:flex; gap:12px; justify-content:center; align-items:center; padding:16px 0 24px; }

.modal{ position:fixed; inset:0; background:rgba(0,0,0,.55); display:flex; align-items:center; justify-content:center; padding:16px; }
.sheet{ width:min(980px, 96vw); background:var(--card); border:1px solid var(--border); border-radius:14px; overflow:hidden; }
.sheet-grid{ display:grid; grid-template-columns: 360px 1fr; gap:0; }
.sheet-img{ width:100%; height:100%; object-fit:cover; }
.sheet-body{ padding:18px; }
.sheet-title{ margin:0 0 6px; }
.btn{ padding:8px 12px; border-radius:8px; border:1px solid var(--border); background:#1a1d22; color:var(--text); }
@media (max-width: 860px){
  .sheet-grid{ grid-template-columns: 1fr; }
  .sheet-img{ height:280px; }
}
`;
