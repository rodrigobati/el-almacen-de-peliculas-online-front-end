import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { searchMovies } from "../api/movies";
import { emitDevEvent } from "../utils/devDiagnostics";

export default function AdminCatalogo() {
  const { keycloak } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
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
  const isDev = import.meta.env?.DEV;
  const toastIdRef = useRef(0);

  const accessToken = keycloak?.token;

  const isUnauthorized = status === 401;
  const isForbidden = status === 403;
  const isValidationError = status === 400;
  const hasGenericError = Boolean(error) && !isUnauthorized && !isForbidden && !isValidationError;
  const showEmptyState =
    !loading &&
    !isUnauthorized &&
    !isForbidden &&
    !isValidationError &&
    !hasGenericError &&
    items.length === 0 &&
    totalPages === 0;
  const shouldShowPager = totalPages > 0;

  const statusFor = (id) => (retiredIds.has(id) ? "Retirada" : "Activa");

  const showToast = (variant, title, description = "") => {
    const toastId = `toast-${Date.now()}-${++toastIdRef.current}`;
    if (isDev) {
      console.log("TOAST_TRIGGER", { toastId, variant, title, description });
      console.trace("TOAST_TRACE", toastId);
    }
    setToast({ open: true, title, description, variant });
  };

  const normalizeError = (err, context) => {
    const message = String(err?.message || "");
    const name = String(err?.name || "");
    const status = err?.status;
    const contextInfo = err?.context?.url
      ? `${context} (${err.context.method || "GET"} ${err.context.url})`
      : context;
    const isNetworkError =
      /failed to fetch|networkerror|load failed|cors/i.test(message) ||
      (name === "TypeError" && !Number.isFinite(status));
    const normalizedMessage = message || `Error desconocido (${contextInfo})`;
    const finalMessage = isNetworkError
      ? `Error de red / ${normalizedMessage} (${contextInfo})`
      : normalizedMessage || `Error desconocido (${contextInfo})`;

    return {
      isNetworkError,
      isHttpError: Number.isFinite(status),
      message: finalMessage
    };
  };

  const getHttpStatusFromError = (err) => {
    if (Number.isFinite(err?.httpStatus)) {
      return err.httpStatus;
    }
    if (Number.isFinite(err?.status)) {
      return err.status;
    }
    return null;
  };

  const getUiErrorMessage = (err, httpStatus) => {
    if (httpStatus === 401) {
      return "No autenticado. Inicia sesión para continuar.";
    }
    if (httpStatus === 403) {
      return "No autorizado.";
    }
    if (httpStatus === 400) {
      return String(err?.rawMessage || err?.message || "Solicitud inválida.");
    }
    return "No se pudo cargar el catálogo. Intenta nuevamente.";
  };

  const loadMovies = async () => {
    setLoading(true);
    try {
      if (isDev) {
        console.log("LOAD_MOVIES_START", { query, page, size });
      }
      const data = await listMovies(accessToken, { q: query, page, size, sort: "fechaSalida", asc: false });
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number.isFinite(data.total) ? data.total : 0);
      setTotalPages(Number.isFinite(data.totalPages) ? data.totalPages : 0);
      setSize(Number.isFinite(data.size) ? data.size : size);
      setStatus(Number.isFinite(data.status) ? data.status : 200);
      setError("");
      if (isDev) {
        console.log("LOAD_MOVIES_OK", { total: data.total, items: data.items?.length });
      }
    } catch (err) {
      const httpStatus = getHttpStatusFromError(err);
      const uiMessage = getUiErrorMessage(err, httpStatus);
      setItems([]);
      setTotal(0);
      setTotalPages(0);
      setStatus(httpStatus);
      setError(uiMessage);
      if (isDev) {
        console.error("LOAD_MOVIES_FAIL", err);
      }
      console.error("Error cargando peliculas:", err);
      showToast("error", "No se pudo cargar el catalogo", uiMessage);
    } finally {
      setLoading(false);
    }
  };

  const runDevVerification = async () => {
    if (!isDev) {
      return;
    }

    emitDevEvent("DEV_VERIFY_START", { source: "AdminCatalogo" });

    try {
      const page0 = await searchMovies({ page: 0, size, sort: "fechaSalida", asc: false });
      emitDevEvent("PUBLIC_PAGE_FETCH_OK", {
        source: "DEV_VERIFY",
        page: 0,
        size,
        status: page0.status,
        total: page0.total,
        itemsLength: page0.items?.length ?? 0,
      });
    } catch (err) {
      emitDevEvent("PUBLIC_PAGE_FETCH_FAIL", {
        source: "DEV_VERIFY",
        page: 0,
        size,
        error: err?.message || String(err),
      });
    }

    try {
      const page1 = await searchMovies({ page: 1, size, sort: "fechaSalida", asc: false });
      emitDevEvent("PUBLIC_PAGE_FETCH_OK", {
        source: "DEV_VERIFY",
        page: 1,
        size,
        status: page1.status,
        total: page1.total,
        itemsLength: page1.items?.length ?? 0,
      });
    } catch (err) {
      emitDevEvent("PUBLIC_PAGE_FETCH_FAIL", {
        source: "DEV_VERIFY",
        page: 1,
        size,
        error: err?.message || String(err),
      });
    }

    if (!accessToken) {
      emitDevEvent("ADMIN_SAVE_FAIL", {
        source: "DEV_VERIFY",
        reason: "missing-access-token",
      });
      showToast("error", "Sesion requerida", "Volvé a iniciar sesión.");
      return;
    }

    const uniqueTitle = `DEV-VERIFY-${Date.now()}`;
    const payload = {
      titulo: uniqueTitle,
      condicion: "nuevo",
      directoresIds: [1],
      precio: 1234,
      formato: "DVD",
      genero: "Drama",
      sinopsis: "diagnostic verification payload",
      actoresIds: [3],
      imagenUrl: "https://example.com/dev-verify.jpg",
      fechaSalida: "2020-01-01",
      rating: 5,
    };

    try {
      const saveResult = await createMovie(accessToken, payload);
      emitDevEvent("ADMIN_SAVE_OK", {
        source: "DEV_VERIFY",
        status: saveResult?.status,
        ok: saveResult?.ok,
        title: uniqueTitle,
      });
      showToast("success", "Verificacion DEV: guardado OK", `status=${saveResult?.status}`);
    } catch (err) {
      emitDevEvent("ADMIN_SAVE_FAIL", {
        source: "DEV_VERIFY",
        message: err?.message || String(err),
        status: err?.status,
      });
      showToast("error", "Verificacion DEV: fallo guardado", err?.message || String(err));
      return;
    }

    try {
      const refreshed = await listMovies(accessToken, { q: query, page, size, sort: "fechaSalida", asc: false });
      setItems(Array.isArray(refreshed.items) ? refreshed.items : []);
      setTotal(Number.isFinite(refreshed.total) ? refreshed.total : 0);
      setTotalPages(Number.isFinite(refreshed.totalPages) ? refreshed.totalPages : 0);
      setSize(Number.isFinite(refreshed.size) ? refreshed.size : size);
      setStatus(Number.isFinite(refreshed.status) ? refreshed.status : 200);
      setError("");
      emitDevEvent("ADMIN_REFRESH_OK", {
        source: "DEV_VERIFY",
        page,
        size,
        total: refreshed.total,
        itemsLength: refreshed.items?.length ?? 0,
        status: refreshed.status,
      });
    } catch (err) {
      emitDevEvent("ADMIN_REFRESH_FAIL", {
        source: "DEV_VERIFY",
        message: err?.message || String(err),
      });
      showToast(
        "error",
        "Guardado OK, pero no se pudo refrescar el catálogo",
        err?.message || String(err)
      );
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
    if (isDev) {
      console.log("SAVE_CALL_START", { mode: formMode, hasId: Boolean(formData?.id) });
    }
    try {
      if (formMode === "create") {
        const result = await createMovie(accessToken, payload);
        emitDevEvent("ADMIN_SAVE_OK", {
          source: "USER_ACTION",
          operation: "create",
          status: result?.status,
          ok: result?.ok,
        });
        showToast("success", "Pelicula creada", "Se agrego al catalogo.");
      } else if (formMode === "edit" && formData?.id) {
        const result = await updateMovie(accessToken, formData.id, payload);
        emitDevEvent("ADMIN_SAVE_OK", {
          source: "USER_ACTION",
          operation: "update",
          status: result?.status,
          ok: result?.ok,
          id: formData.id,
        });
        showToast("success", "Pelicula actualizada", "Cambios guardados.");
      }
      setFormOpen(false);
      setFormData(null);
      if (isDev) {
        console.log("SAVE_CALL_OK");
      }
    } catch (err) {
      if (isDev) {
        console.error("SAVE_CALL_FAIL", {
          name: err?.name,
          message: err?.message,
          status: err?.status,
          context: err?.context
        });
      }
      emitDevEvent("ADMIN_SAVE_FAIL", {
        source: "USER_ACTION",
        operation: formMode,
        message: err?.message || String(err),
        status: err?.status,
      });
      console.error("Error guardando pelicula:", err);
      const normalized = normalizeError(err, "guardar");
      let title = "No se pudo guardar";
      let description = normalized.message;

      if (normalized.isNetworkError) {
        title = "No se pudo confirmar el guardado";
        description = `El POST pudo haberse procesado, pero el navegador no pudo leer la respuesta. ${normalized.message}`;
      } else if (!normalized.isHttpError) {
        title = "Error inesperado al guardar";
        description = normalized.message;
      }
      showToast("error", title, description);
      return;
    } finally {
      setPending(false);
    }

    try {
      if (isDev) {
        console.log("REFRESH_START");
      }
      await loadMovies();
      emitDevEvent("ADMIN_REFRESH_OK", {
        source: "USER_ACTION",
        afterOperation: formMode,
      });
      if (isDev) {
        console.log("REFRESH_OK");
      }
    } catch (err) {
      if (isDev) {
        console.error("REFRESH_FAIL", {
          name: err?.name,
          message: err?.message,
          status: err?.status,
          context: err?.context
        });
      }
      emitDevEvent("ADMIN_REFRESH_FAIL", {
        source: "USER_ACTION",
        afterOperation: formMode,
        message: err?.message || String(err),
        status: err?.status,
      });
      console.error("Error refrescando catalogo:", err);
      const normalized = normalizeError(err, "refrescar catalogo");
      showToast(
        "error",
        "Guardado OK, pero no se pudo refrescar el catalogo",
        normalized.message
      );
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
            <h2>Administración de catálogo</h2>
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
          {isDev ? (
            <button className="btn-secondary" onClick={runDevVerification}>
              Ejecutar verificación (DEV)
            </button>
          ) : null}
        </div>
      </header>

      <main className="container admin-container">
        {loading ? <p className="muted">Cargando catalogo...</p> : null}

        {!loading && isUnauthorized ? <p className="muted">No autenticado. Inicia sesión para continuar.</p> : null}
        {!loading && isForbidden ? <p className="muted">No autorizado.</p> : null}
        {!loading && isValidationError ? <p className="muted">{error}</p> : null}
        {!loading && hasGenericError ? <p className="muted">{error}</p> : null}

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
              {showEmptyState ? (
                <tr>
                  <td colSpan={6} className="muted">
                    No hay películas para mostrar.
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

        {shouldShowPager ? (
          <div className="pager admin-pager">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page <= 0}
            >
              Anterior
            </button>
            <span>
              Página {page + 1} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={totalPages === 0 || page >= totalPages - 1}
            >
              Siguiente
            </button>
          </div>
        ) : null}
      </main>

      <AdminMovieFormModal
        open={formOpen}
        mode={formMode}
        initialData={formData}
        accessToken={accessToken}
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
