import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";
import AdminMovieFormModal from "../components/AdminMovieFormModal";
import {
  listMovies,
  getMovieDetail,
  createMovie,
  updateMovie,
  retireMovie
} from "../api/catalogoAdmin";

export default function AdminCatalogo() {
  const { keycloak } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    title: "",
    description: "",
    variant: "success"
  });
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formData, setFormData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toRetire, setToRetire] = useState(null);
  const [retiredIds, setRetiredIds] = useState(() => new Set());

  const accessToken = keycloak?.token;

  const pages = Math.max(1, Math.ceil(total / size));

  const statusFor = (id) => (retiredIds.has(id) ? "Retirada" : "Activa");

  const showToast = (variant, title, description = "") => {
    setToast({ open: true, title, description, variant });
  };

  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await listMovies({ q: query, page, size, sort: "fechaSalida", asc: false });
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number.isFinite(data.total) ? data.total : 0);
    } catch (err) {
      console.error("Error cargando peliculas:", err);
      showToast("error", "No se pudo cargar el catalogo", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadMovies();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    loadMovies();
  }, [page]);

  const handleAdd = () => {
    setFormMode("create");
    setFormData(null);
    setFormOpen(true);
  };

  const handleEdit = async (item) => {
    setFormMode("edit");
    setFormOpen(true);
    setFormData(item);

    if (!item?.id) return;

    try {
      const detail = await getMovieDetail(item.id);
      setFormData(detail);
    } catch (err) {
      console.error("Error cargando detalle:", err);
      showToast("error", "No se pudo cargar la pelicula", err.message);
    }
  };

  const handleSubmit = async (payload) => {
    if (!accessToken) {
      showToast("error", "Sesion requerida", "Volvé a iniciar sesión.");
      return;
    }

    setPending(true);
    try {
      if (formMode === "create") {
        await createMovie(accessToken, payload);
        showToast("success", "Pelicula creada", "Se agrego al catalogo.");
      } else if (formMode === "edit" && formData?.id) {
        await updateMovie(accessToken, formData.id, payload);
        showToast("success", "Pelicula actualizada", "Cambios guardados.");
      }
      setFormOpen(false);
      setFormData(null);
      await loadMovies();
    } catch (err) {
      console.error("Error guardando pelicula:", err);
      showToast("error", "No se pudo guardar", err.message);
    } finally {
      setPending(false);
    }
  };

  const openRetire = (item) => {
    setToRetire(item);
    setConfirmOpen(true);
  };

  const confirmRetire = async () => {
    if (!toRetire?.id) {
      setConfirmOpen(false);
      return;
    }

    if (!accessToken) {
      showToast("error", "Sesion requerida", "Volvé a iniciar sesión.");
      setConfirmOpen(false);
      return;
    }

    setPending(true);
    try {
      await retireMovie(accessToken, toRetire.id);
      setRetiredIds((prev) => {
        const next = new Set(prev);
        next.add(toRetire.id);
        return next;
      });
      showToast("success", "Pelicula retirada", "Ya no esta disponible.");
      setConfirmOpen(false);
      setToRetire(null);
      await loadMovies();
    } catch (err) {
      console.error("Error retirando pelicula:", err);
      showToast("error", "No se pudo retirar", err.message);
    } finally {
      setPending(false);
    }
  };

  const clearConfirm = () => {
    setConfirmOpen(false);
    setToRetire(null);
  };

  const filteredItems = useMemo(() => items, [items]);

  return (
    <div>
      <header className="topbar">
        <div className="container row admin-topbar">
          <div>
            <h2>Admin catalogo</h2>
            <p className="muted">Gestiona altas, cambios y retiros.</p>
          </div>
          <div className="grow">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por titulo..."
              className="search"
              aria-label="Buscar peliculas"
            />
          </div>
          <button className="btn admin-add" onClick={handleAdd}>
            + Agregar pelicula
          </button>
        </div>
      </header>

      <main className="container admin-container">
        {loading ? <p className="muted">Cargando catalogo...</p> : null}

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Fecha</th>
                <th>Precio</th>
                <th>Formato / Genero</th>
                <th>Estado</th>
                <th className="admin-actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="muted">
                    No hay peliculas para mostrar.
                  </td>
                </tr>
              ) : null}

              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-title">{item.titulo}</div>
                  </td>
                  <td>{item.fechaSalida || "-"}</td>
                  <td>${Number(item.precio || 0).toLocaleString()}</td>
                  <td>
                    <span className="badge">{item.formato || "-"}</span>
                    <span className="badge badge-secondary">{item.genero || "-"}</span>
                  </td>
                  <td>
                    <span className={`status-pill ${statusFor(item.id) === "Retirada" ? "status-off" : "status-on"}`}>
                      {statusFor(item.id)}
                    </span>
                  </td>
                  <td className="admin-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleEdit(item)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => openRetire(item)}
                      disabled={pending}
                    >
                      Retirar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pager admin-pager">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Anterior
          </button>
          <span>
            Pagina {page + 1} de {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={page >= pages - 1}
          >
            Siguiente
          </button>
        </div>
      </main>

      <AdminMovieFormModal
        open={formOpen}
        mode={formMode}
        initialData={formData}
        submitting={pending}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        open={confirmOpen}
        title="Retirar pelicula"
        message={`Vas a retirar "${toRetire?.titulo || ""}" del catalogo. Esta accion es reversible solo por un nuevo alta. ¿Confirmas?`}
        confirmLabel="Retirar"
        cancelLabel="Cancelar"
        onConfirm={confirmRetire}
        onCancel={clearConfirm}
      />

      <Toast
        open={toast.open}
        title={toast.title}
        description={toast.description}
        variant={toast.variant}
        onClose={() => setToast((current) => ({ ...current, open: false }))}
      />
    </div>
  );
}
