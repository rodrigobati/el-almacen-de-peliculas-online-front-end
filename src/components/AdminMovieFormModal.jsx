import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_FORM = {
  titulo: "",
  fechaSalida: "",
  precio: "",
  condicion: "nuevo",
  formato: "",
  genero: "",
  sinopsis: "",
  imagenUrl: "",
  directoresIdsRaw: "",
  actoresIdsRaw: "",
  rating: "0",
  directoresActuales: [],
  actoresActuales: []
};

function parseIds(raw) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);
}

export default function AdminMovieFormModal({
  open = false,
  mode = "create",
  initialData = null,
  submitting = false,
  onClose,
  onSubmit
}) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;

    if (!initialData) {
      setForm(DEFAULT_FORM);
      setErrors({});
      return;
    }

    setForm({
      ...DEFAULT_FORM,
      titulo: initialData.titulo ?? "",
      fechaSalida: initialData.fechaSalida ?? "",
      precio: initialData.precio != null ? String(initialData.precio) : "",
      condicion: initialData.condicion ?? "nuevo",
      formato: initialData.formato ?? "",
      genero: initialData.genero ?? "",
      sinopsis: initialData.sinopsis ?? "",
      imagenUrl: initialData.imagenUrl ?? "",
      rating: initialData.rating != null ? String(initialData.rating) : "0",
      directoresActuales: Array.isArray(initialData.directores)
        ? initialData.directores
        : [],
      actoresActuales: Array.isArray(initialData.actores)
        ? initialData.actores
        : []
    });
    setErrors({});
  }, [open, initialData]);

  const heading = mode === "edit" ? "Editar pelicula" : "Nueva pelicula";

  const directorHint = useMemo(() => {
    if (form.directoresActuales.length === 0) return "";
    return `Directores actuales: ${form.directoresActuales.join(", ")}`;
  }, [form.directoresActuales]);

  const actorHint = useMemo(() => {
    if (form.actoresActuales.length === 0) return "";
    return `Actores actuales: ${form.actoresActuales.join(", ")}`;
  }, [form.actoresActuales]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.titulo.trim()) nextErrors.titulo = "El titulo es obligatorio";
    if (!form.fechaSalida) nextErrors.fechaSalida = "La fecha de salida es obligatoria";
    if (!form.precio || Number(form.precio) <= 0) nextErrors.precio = "El precio debe ser positivo";
    if (!form.formato.trim()) nextErrors.formato = "El formato es obligatorio";
    if (!form.genero.trim()) nextErrors.genero = "El genero es obligatorio";

    const directorIds = parseIds(form.directoresIdsRaw);
    if (directorIds.length === 0) nextErrors.directoresIdsRaw = "Ingresá al menos un id de director";

    const actorIds = parseIds(form.actoresIdsRaw);
    if (actorIds.length === 0) nextErrors.actoresIdsRaw = "Ingresá al menos un id de actor";

    setErrors(nextErrors);
    return {
      ok: Object.keys(nextErrors).length === 0,
      directorIds,
      actorIds
    };
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const { ok, directorIds, actorIds } = validate();
    if (!ok) return;

    const payload = {
      titulo: form.titulo.trim(),
      condicion: form.condicion,
      directoresIds: directorIds,
      precio: Number(form.precio),
      formato: form.formato.trim(),
      genero: form.genero.trim(),
      sinopsis: form.sinopsis.trim(),
      actoresIds: actorIds,
      imagenUrl: form.imagenUrl.trim(),
      fechaSalida: form.fechaSalida,
      rating: Number(form.rating || 0)
    };

    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
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

            <label className="admin-field">
              <span>Formato *</span>
              <input
                name="formato"
                value={form.formato}
                onChange={handleChange}
                type="text"
                required
              />
              {errors.formato && <span className="field-error">{errors.formato}</span>}
            </label>

            <label className="admin-field">
              <span>Genero *</span>
              <input
                name="genero"
                value={form.genero}
                onChange={handleChange}
                type="text"
                required
              />
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

            <label className="admin-field admin-field-full">
              <span>Ids de directores *</span>
              <input
                name="directoresIdsRaw"
                value={form.directoresIdsRaw}
                onChange={handleChange}
                type="text"
                placeholder="Ej: 1, 2"
                required
              />
              {directorHint && <span className="field-hint">{directorHint}</span>}
              {errors.directoresIdsRaw && (
                <span className="field-error">{errors.directoresIdsRaw}</span>
              )}
            </label>

            <label className="admin-field admin-field-full">
              <span>Ids de actores *</span>
              <input
                name="actoresIdsRaw"
                value={form.actoresIdsRaw}
                onChange={handleChange}
                type="text"
                placeholder="Ej: 3, 7"
                required
              />
              {actorHint && <span className="field-hint">{actorHint}</span>}
              {errors.actoresIdsRaw && (
                <span className="field-error">{errors.actoresIdsRaw}</span>
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
    </div>
  );
}
