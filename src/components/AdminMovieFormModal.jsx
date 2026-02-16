import React, { useEffect, useRef, useState } from "react";
import {
  createActor,
  createDirector,
  fetchActores,
  fetchDirectores,
  fetchFormatos,
  fetchGeneros
} from "../api/catalogoAdmin";

const DEFAULT_FORM = {
  titulo: "",
  fechaSalida: "",
  precio: "",
  condicion: "nuevo",
  formato: "",
  genero: "",
  sinopsis: "",
  imagenUrl: "",
  rating: "0",
  formatoQuery: "",
  generoQuery: "",
  directorQuery: "",
  actorQuery: ""
};

export default function AdminMovieFormModal({
  open = false,
  mode = "create",
  initialData = null,
  accessToken,
  submitting = false,
  onClose,
  onSubmit
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [directorOptions, setDirectorOptions] = useState([]);
  const [actorOptions, setActorOptions] = useState([]);
  const [selectedDirectores, setSelectedDirectores] = useState([]);
  const [selectedActores, setSelectedActores] = useState([]);
  const [loadingDirectores, setLoadingDirectores] = useState(false);
  const [loadingActores, setLoadingActores] = useState(false);
  const [loadingFormatos, setLoadingFormatos] = useState(false);
  const [loadingGeneros, setLoadingGeneros] = useState(false);
  const [directoresOpen, setDirectoresOpen] = useState(false);
  const [actoresOpen, setActoresOpen] = useState(false);
  const [formatoOpen, setFormatoOpen] = useState(false);
  const [generoOpen, setGeneroOpen] = useState(false);
  const [directoresAuthError, setDirectoresAuthError] = useState("");
  const [actoresAuthError, setActoresAuthError] = useState("");
  const [formatoError, setFormatoError] = useState("");
  const [generoError, setGeneroError] = useState("");
  const [formatoOptions, setFormatoOptions] = useState([]);
  const [generoOptions, setGeneroOptions] = useState([]);
  const [newDirectorOpen, setNewDirectorOpen] = useState(false);
  const [newActorOpen, setNewActorOpen] = useState(false);
  const [newDirectorNombre, setNewDirectorNombre] = useState("");
  const [newActorNombre, setNewActorNombre] = useState("");
  const [newDirectorError, setNewDirectorError] = useState("");
  const [newActorError, setNewActorError] = useState("");
  const [creatingDirector, setCreatingDirector] = useState(false);
  const [creatingActor, setCreatingActor] = useState(false);
  const directoresWrapRef = useRef(null);
  const actoresWrapRef = useRef(null);
  const formatoWrapRef = useRef(null);
  const generoWrapRef = useRef(null);

  const listToArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
  };

  const addUnique = (current, item) => {
    if (!item?.id) return current;
    if (current.some((existing) => existing.id === item.id)) {
      return current;
    }
    return [...current, item];
  };

  const listToNameArray = (payload) => {
    const list = listToArray(payload);
    return list
      .map((item) => {
        if (typeof item === "string") return item;
        return String(item?.nombre || item?.titulo || item?.name || "").trim();
      })
      .filter((name) => name.length > 0);
  };

  const loadDirectores = async (query = "") => {
    if (!accessToken) return;
    setLoadingDirectores(true);
    setDirectoresAuthError("");
    try {
      const result = await fetchDirectores(accessToken, { q: query, size: 15 });
      const items = listToArray(result);
      setDirectorOptions(items);
      if (import.meta.env?.DEV) {
        console.debug("DIRECTORES_OPTIONS_LOADED", { query, count: items.length });
      }
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.debug("DIRECTORES_OPTIONS_ERROR", {
          query,
          status: error?.status,
          message: error?.message
        });
      }
      if (error?.status === 401 || error?.status === 403) {
        setDirectoresAuthError("No autorizado (admin token)");
        setDirectorOptions([]);
        return;
      }
      setDirectoresAuthError("No se pudieron cargar directores");
      setDirectorOptions([]);
    } finally {
      setLoadingDirectores(false);
    }
  };

  const loadActores = async (query = "") => {
    if (!accessToken) return;
    setLoadingActores(true);
    setActoresAuthError("");
    try {
      const result = await fetchActores(accessToken, { q: query, size: 15 });
      const items = listToArray(result);
      setActorOptions(items);
      if (import.meta.env?.DEV) {
        console.debug("ACTORES_OPTIONS_LOADED", { query, count: items.length });
      }
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.debug("ACTORES_OPTIONS_ERROR", {
          query,
          status: error?.status,
          message: error?.message
        });
      }
      if (error?.status === 401 || error?.status === 403) {
        setActoresAuthError("No autorizado (admin token)");
        setActorOptions([]);
        return;
      }
      setActoresAuthError("No se pudieron cargar actores");
      setActorOptions([]);
    } finally {
      setLoadingActores(false);
    }
  };

  const loadFormatos = async (query = "") => {
    setLoadingFormatos(true);
    setFormatoError("");
    try {
      const names = await fetchFormatos(accessToken, { q: query, size: 15 });
      setFormatoOptions(listToNameArray(names));
      if (import.meta.env?.DEV) {
        console.debug("FORMATOS_OPTIONS_LOADED", { query, count: names?.length || 0 });
      }
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.debug("FORMATOS_OPTIONS_ERROR", {
          query,
          status: error?.status,
          message: error?.message
        });
      }
      setFormatoError("No se pudieron cargar formatos");
      setFormatoOptions([]);
    } finally {
      setLoadingFormatos(false);
    }
  };

  const loadGeneros = async (query = "") => {
    setLoadingGeneros(true);
    setGeneroError("");
    try {
      const names = await fetchGeneros(accessToken, { q: query, size: 15 });
      setGeneroOptions(listToNameArray(names));
      if (import.meta.env?.DEV) {
        console.debug("GENEROS_OPTIONS_LOADED", { query, count: names?.length || 0 });
      }
    } catch (error) {
      if (import.meta.env?.DEV) {
        console.debug("GENEROS_OPTIONS_ERROR", {
          query,
          status: error?.status,
          message: error?.message
        });
      }
      setGeneroError("No se pudieron cargar géneros");
      setGeneroOptions([]);
    } finally {
      setLoadingGeneros(false);
    }
  };

  const resolveByName = async (names, loaderFn) => {
    const resolved = [];
    const seen = new Set();

    for (const name of names) {
      if (!name?.trim()) continue;
      const result = await loaderFn(name);
      const list = listToArray(result);
      const exact = list.find(
        (item) =>
          String(item?.nombre || "").toLowerCase() === String(name).toLowerCase()
      );

      const selected = exact || list[0];
      if (selected?.id && !seen.has(selected.id)) {
        seen.add(selected.id);
        resolved.push(selected);
      }
    }

    return resolved;
  };

  useEffect(() => {
    if (!open) return;

    const bootstrap = async () => {
      if (!initialData) {
        setForm(DEFAULT_FORM);
        setSelectedDirectores([]);
        setSelectedActores([]);
        setDirectoresOpen(false);
        setActoresOpen(false);
        setFormatoOpen(false);
        setGeneroOpen(false);
        setDirectoresAuthError("");
        setActoresAuthError("");
        setFormatoError("");
        setGeneroError("");
        setErrors({});
        await Promise.all([
          loadDirectores(""),
          loadActores(""),
          loadFormatos(""),
          loadGeneros("")
        ]);
        return;
      }

      setForm({
        ...DEFAULT_FORM,
        titulo: initialData.titulo ?? "",
        fechaSalida: initialData.fechaSalida ?? "",
        precio: initialData.precio != null ? String(initialData.precio) : "",
        condicion: initialData.condicion ?? "nuevo",
        formato: initialData.formato ?? "",
        formatoQuery: initialData.formato ?? "",
        genero: initialData.genero ?? "",
        generoQuery: initialData.genero ?? "",
        sinopsis: initialData.sinopsis ?? "",
        imagenUrl: initialData.imagenUrl ?? "",
        rating: initialData.rating != null ? String(initialData.rating) : "0"
      });

      setErrors({});
        setDirectoresOpen(false);
        setActoresOpen(false);
        setFormatoOpen(false);
        setGeneroOpen(false);
        setDirectoresAuthError("");
        setActoresAuthError("");
        setFormatoError("");
        setGeneroError("");

      await Promise.all([
        loadDirectores(""),
        loadActores(""),
        loadFormatos(initialData.formato ?? ""),
        loadGeneros(initialData.genero ?? "")
      ]);

      const directoresIniciales = await resolveByName(
        Array.isArray(initialData.directores) ? initialData.directores : [],
        (q) => fetchDirectores(accessToken, { q })
      );

      const actoresIniciales = await resolveByName(
        Array.isArray(initialData.actores) ? initialData.actores : [],
        (q) => fetchActores(accessToken, { q })
      );

      setSelectedDirectores(directoresIniciales);
      setSelectedActores(actoresIniciales);
    };

    bootstrap();
  }, [open, initialData, accessToken]);

  useEffect(() => {
    if (!open || !directoresOpen) return;
    const timer = setTimeout(() => {
      loadDirectores(form.directorQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [form.directorQuery, open, directoresOpen]);

  useEffect(() => {
    if (!open || !actoresOpen) return;
    const timer = setTimeout(() => {
      loadActores(form.actorQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [form.actorQuery, open, actoresOpen]);

  useEffect(() => {
    if (!open || !formatoOpen) return;
    const timer = setTimeout(() => {
      loadFormatos(form.formatoQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [form.formatoQuery, open, formatoOpen]);

  useEffect(() => {
    if (!open || !generoOpen) return;
    const timer = setTimeout(() => {
      loadGeneros(form.generoQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [form.generoQuery, open, generoOpen]);

  useEffect(() => {
    if (!open) return;

    const handleDocumentMouseDown = (event) => {
      const directorWrap = directoresWrapRef.current;
      const actorWrap = actoresWrapRef.current;
      const formatoWrap = formatoWrapRef.current;
      const generoWrap = generoWrapRef.current;

      if (directorWrap && !directorWrap.contains(event.target)) {
        setDirectoresOpen(false);
      }

      if (actorWrap && !actorWrap.contains(event.target)) {
        setActoresOpen(false);
      }

      if (formatoWrap && !formatoWrap.contains(event.target)) {
        setFormatoOpen(false);
      }

      if (generoWrap && !generoWrap.contains(event.target)) {
        setGeneroOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentMouseDown);
    return () => document.removeEventListener("mousedown", handleDocumentMouseDown);
  }, [open]);

  const heading = mode === "edit" ? "Editar pelicula" : "Nueva pelicula";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const addDirector = (director) => {
    setSelectedDirectores((prev) => addUnique(prev, director));
    setDirectoresOpen(false);
  };

  const addActor = (actor) => {
    setSelectedActores((prev) => addUnique(prev, actor));
    setActoresOpen(false);
  };

  const openDirectoresDropdown = () => {
    if (!directoresOpen && import.meta.env?.DEV) {
      console.debug("DIRECTORES_DROPDOWN_OPEN");
    }
    setDirectoresOpen(true);
    loadDirectores(form.directorQuery || "");
  };

  const openActoresDropdown = () => {
    if (!actoresOpen && import.meta.env?.DEV) {
      console.debug("ACTORES_DROPDOWN_OPEN");
    }
    setActoresOpen(true);
    loadActores(form.actorQuery || "");
  };

  const openFormatoDropdown = () => {
    if (!formatoOpen && import.meta.env?.DEV) {
      console.debug("FORMATOS_DROPDOWN_OPEN");
    }
    setFormatoOpen(true);
    loadFormatos(form.formatoQuery || "");
  };

  const openGeneroDropdown = () => {
    if (!generoOpen && import.meta.env?.DEV) {
      console.debug("GENEROS_DROPDOWN_OPEN");
    }
    setGeneroOpen(true);
    loadGeneros(form.generoQuery || "");
  };

  const selectFormato = (nombre) => {
    setForm((prev) => ({
      ...prev,
      formato: nombre,
      formatoQuery: nombre
    }));
    setFormatoOpen(false);
  };

  const selectGenero = (nombre) => {
    setForm((prev) => ({
      ...prev,
      genero: nombre,
      generoQuery: nombre
    }));
    setGeneroOpen(false);
  };

  const removeDirector = (id) => {
    setSelectedDirectores((prev) => prev.filter((item) => item.id !== id));
  };

  const removeActor = (id) => {
    setSelectedActores((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateDirector = async () => {
    setNewDirectorError("");
    setCreatingDirector(true);
    try {
      const created = await createDirector(accessToken, { nombre: newDirectorNombre });
      addDirector(created);
      setNewDirectorNombre("");
      setNewDirectorOpen(false);
      await loadDirectores(form.directorQuery);
    } catch (error) {
      setNewDirectorError(error?.message || "No se pudo crear el director");
    } finally {
      setCreatingDirector(false);
    }
  };

  const handleCreateActor = async () => {
    setNewActorError("");
    setCreatingActor(true);
    try {
      const created = await createActor(accessToken, { nombre: newActorNombre });
      addActor(created);
      setNewActorNombre("");
      setNewActorOpen(false);
      await loadActores(form.actorQuery);
    } catch (error) {
      setNewActorError(error?.message || "No se pudo crear el actor");
    } finally {
      setCreatingActor(false);
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.titulo.trim()) nextErrors.titulo = "El titulo es obligatorio";
    if (!form.fechaSalida) nextErrors.fechaSalida = "La fecha de salida es obligatoria";
    if (!form.precio || Number(form.precio) <= 0) nextErrors.precio = "El precio debe ser positivo";
    if (!form.formato.trim()) nextErrors.formato = "El formato es obligatorio";
    if (!form.genero.trim()) nextErrors.genero = "El genero es obligatorio";

    if (selectedDirectores.length === 0) {
      nextErrors.directores = "Seleccioná al menos un director";
    }

    if (selectedActores.length === 0) {
      nextErrors.actores = "Seleccioná al menos un actor";
    }

    setErrors(nextErrors);
    return {
      ok: Object.keys(nextErrors).length === 0
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { ok } = validate();
    if (!ok) return;

    const payload = {
      titulo: form.titulo.trim(),
      condicion: form.condicion,
      directoresIds: selectedDirectores.map((director) => director.id),
      precio: Number(form.precio),
      formato: form.formato.trim(),
      genero: form.genero.trim(),
      sinopsis: form.sinopsis.trim(),
      actoresIds: selectedActores.map((actor) => actor.id),
      imagenUrl: form.imagenUrl.trim(),
      fechaSalida: form.fechaSalida,
      rating: Number(form.rating || 0)
    };

    onSubmit(payload);
  };

  const handleParentOverlayClick = () => {
    if (newDirectorOpen || newActorOpen) {
      return;
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleParentOverlayClick}>
      <div
        className="modal-content admin-form-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-movie-modal-title"
      >
        <h2 id="admin-movie-modal-title" className="modal-title">
          {heading}
        </h2>
        <div className="field-hint">FRONTEND_BUILD_CHECK_V5_FORMATO_GENERO</div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Titulo *</span>
              <input
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                type="text"
                required
              />
              {errors.titulo && <span className="field-error">{errors.titulo}</span>}
            </label>

            <label className="admin-field">
              <span>Fecha de salida *</span>
              <input
                name="fechaSalida"
                value={form.fechaSalida}
                onChange={handleChange}
                type="date"
                required
              />
              {errors.fechaSalida && (
                <span className="field-error">{errors.fechaSalida}</span>
              )}
            </label>

            <label className="admin-field">
              <span>Precio *</span>
              <input
                name="precio"
                value={form.precio}
                onChange={handleChange}
                type="number"
                step="0.01"
                min="0"
                required
              />
              {errors.precio && <span className="field-error">{errors.precio}</span>}
            </label>

            <label className="admin-field">
              <span>Condicion *</span>
              <select name="condicion" value={form.condicion} onChange={handleChange}>
                <option value="nuevo">nuevo</option>
                <option value="usado">usado</option>
              </select>
            </label>

            <label className="admin-field" ref={formatoWrapRef}>
              <span>Formato *</span>
              <input
                name="formatoQuery"
                value={form.formatoQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    formatoQuery: value,
                    formato: value
                  }));
                }}
                onFocus={openFormatoDropdown}
                onClick={openFormatoDropdown}
                type="text"
                required
                placeholder="Buscar formato"
              />
              {formatoOpen && (
                <div
                  className="selector-results"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {loadingFormatos ? (
                    <span className="field-hint">Buscando...</span>
                  ) : formatoError ? (
                    <span className="field-error">{formatoError}</span>
                  ) : formatoOptions.length === 0 ? (
                    <span className="field-hint">No hay resultados. Podés escribir manualmente.</span>
                  ) : (
                    formatoOptions.map((nombre) => (
                      <button
                        key={nombre}
                        type="button"
                        className={`selector-item ${form.formato === nombre ? "selector-item--selected" : ""}`}
                        onClick={() => selectFormato(nombre)}
                      >
                        {nombre}
                      </button>
                    ))
                  )}
                </div>
              )}
              {errors.formato && <span className="field-error">{errors.formato}</span>}
            </label>

            <label className="admin-field" ref={generoWrapRef}>
              <span>Genero *</span>
              <input
                name="generoQuery"
                value={form.generoQuery}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    generoQuery: value,
                    genero: value
                  }));
                }}
                onFocus={openGeneroDropdown}
                onClick={openGeneroDropdown}
                type="text"
                required
                placeholder="Buscar género"
              />
              {generoOpen && (
                <div
                  className="selector-results"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {loadingGeneros ? (
                    <span className="field-hint">Buscando...</span>
                  ) : generoError ? (
                    <span className="field-error">{generoError}</span>
                  ) : generoOptions.length === 0 ? (
                    <span className="field-hint">No hay resultados. Podés escribir manualmente.</span>
                  ) : (
                    generoOptions.map((nombre) => (
                      <button
                        key={nombre}
                        type="button"
                        className={`selector-item ${form.genero === nombre ? "selector-item--selected" : ""}`}
                        onClick={() => selectGenero(nombre)}
                      >
                        {nombre}
                      </button>
                    ))
                  )}
                </div>
              )}
              {errors.genero && <span className="field-error">{errors.genero}</span>}
            </label>

            <label className="admin-field">
              <span>Imagen URL</span>
              <input
                name="imagenUrl"
                value={form.imagenUrl}
                onChange={handleChange}
                type="url"
                placeholder="https://"
              />
            </label>

            <label className="admin-field">
              <span>Rating</span>
              <input
                name="rating"
                value={form.rating}
                onChange={handleChange}
                type="number"
                min="0"
                max="5"
              />
            </label>

            <label className="admin-field admin-field-full">
              <span>Sinopsis</span>
              <textarea
                name="sinopsis"
                value={form.sinopsis}
                onChange={handleChange}
                rows={3}
              />
            </label>

            <label className="admin-field admin-field-full" ref={directoresWrapRef}>
              <div className="selector-top">
                <span>Directores *</span>
                <button
                  type="button"
                  className="btn-secondary btn-small"
                  onClick={() => setNewDirectorOpen(true)}
                >
                  + Nuevo director
                </button>
              </div>
              <input
                name="directorQuery"
                value={form.directorQuery}
                onChange={handleChange}
                onFocus={openDirectoresDropdown}
                onClick={openDirectoresDropdown}
                type="text"
                placeholder="Buscar directores por nombre"
              />
              {directoresOpen && (
                <div
                  className="selector-results"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {loadingDirectores ? (
                    <span className="field-hint">Buscando...</span>
                  ) : directoresAuthError ? (
                    <span className="field-error">{directoresAuthError}</span>
                  ) : directorOptions.length === 0 ? (
                    <span className="field-hint">No hay resultados</span>
                  ) : (
                    directorOptions.map((director) => (
                      <button
                        key={director.id}
                        type="button"
                        className="selector-item"
                        onClick={() => addDirector(director)}
                      >
                        {director.nombre}
                      </button>
                    ))
                  )}
                </div>
              )}
              <div className="selected-chips">
                {selectedDirectores.map((director) => (
                  <span className="selected-chip" key={director.id}>
                    {director.nombre}
                    <button
                      type="button"
                      className="chip-remove"
                      onClick={() => removeDirector(director.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {errors.directores && (
                <span className="field-error">{errors.directores}</span>
              )}
            </label>

            <label className="admin-field admin-field-full" ref={actoresWrapRef}>
              <div className="selector-top">
                <span>Actores *</span>
                <button
                  type="button"
                  className="btn-secondary btn-small"
                  onClick={() => setNewActorOpen(true)}
                >
                  + Nuevo actor
                </button>
              </div>
              <input
                name="actorQuery"
                value={form.actorQuery}
                onChange={handleChange}
                onFocus={openActoresDropdown}
                onClick={openActoresDropdown}
                type="text"
                placeholder="Buscar actores por nombre"
              />
              {actoresOpen && (
                <div
                  className="selector-results"
                  onMouseDown={(event) => event.preventDefault()}
                >
                  {loadingActores ? (
                    <span className="field-hint">Buscando...</span>
                  ) : actoresAuthError ? (
                    <span className="field-error">{actoresAuthError}</span>
                  ) : actorOptions.length === 0 ? (
                    <span className="field-hint">No hay resultados</span>
                  ) : (
                    actorOptions.map((actor) => (
                      <button
                        key={actor.id}
                        type="button"
                        className="selector-item"
                        onClick={() => addActor(actor)}
                      >
                        {actor.nombre}
                      </button>
                    ))
                  )}
                </div>
              )}
              <div className="selected-chips">
                {selectedActores.map((actor) => (
                  <span className="selected-chip" key={actor.id}>
                    {actor.nombre}
                    <button
                      type="button"
                      className="chip-remove"
                      onClick={() => removeActor(actor.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {errors.actores && (
                <span className="field-error">{errors.actores}</span>
              )}
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn" disabled={submitting}>
              {submitting ? "Guardando..." : "Guardar"}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </form>
      </div>

      {newDirectorOpen && (
        <div
          className="modal-overlay modal-overlay--nested"
          onClick={(event) => {
            event.stopPropagation();
            setNewDirectorOpen(false);
          }}
        >
          <div
            className="modal-content inline-create-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="modal-title">Nuevo director</h3>
            <label className="admin-field">
              <span>Nombre *</span>
              <input
                value={newDirectorNombre}
                onChange={(event) => setNewDirectorNombre(event.target.value)}
                type="text"
                placeholder="Nombre del director"
              />
            </label>
            {newDirectorError && <span className="field-error">{newDirectorError}</span>}
            <div className="admin-form-actions">
              <button
                type="button"
                className="btn"
                onClick={handleCreateDirector}
                disabled={creatingDirector}
              >
                {creatingDirector ? "Creando..." : "Crear"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setNewDirectorOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {newActorOpen && (
        <div
          className="modal-overlay modal-overlay--nested"
          onClick={(event) => {
            event.stopPropagation();
            setNewActorOpen(false);
          }}
        >
          <div
            className="modal-content inline-create-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="modal-title">Nuevo actor</h3>
            <label className="admin-field">
              <span>Nombre *</span>
              <input
                value={newActorNombre}
                onChange={(event) => setNewActorNombre(event.target.value)}
                type="text"
                placeholder="Nombre del actor"
              />
            </label>
            {newActorError && <span className="field-error">{newActorError}</span>}
            <div className="admin-form-actions">
              <button
                type="button"
                className="btn"
                onClick={handleCreateActor}
                disabled={creatingActor}
              >
                {creatingActor ? "Creando..." : "Crear"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setNewActorOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
