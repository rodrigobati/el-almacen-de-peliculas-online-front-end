import { useState } from "react";
import { crearCupon } from "../api/descuentos";
import { useAuth } from "../contexts/AuthContext";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";

export default function AdminDescuentos() {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    porcentaje: "",
    monto: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const [loading, setLoading] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    open: false,
    title: "",
    description: "",
    variant: "success",
  });
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const mostrarToast = (title, description, variant = "success") => {
    setToastConfig({
      open: true,
      title,
      description,
      variant,
    });
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      mostrarToast("Error", "El nombre del cupón es requerido", "error");
      return false;
    }

    if (!formData.porcentaje && !formData.monto) {
      mostrarToast(
        "Error",
        "Debes ingresar porcentaje o monto de descuento",
        "error",
      );
      return false;
    }

    if (
      formData.porcentaje &&
      (isNaN(formData.porcentaje) ||
        formData.porcentaje < 0 ||
        formData.porcentaje > 100)
    ) {
      mostrarToast("Error", "El porcentaje debe estar entre 0 y 100", "error");
      return false;
    }

    if (formData.monto && (isNaN(formData.monto) || formData.monto < 0)) {
      mostrarToast("Error", "El monto debe ser un número positivo", "error");
      return false;
    }

    if (!formData.fechaInicio || !formData.fechaFin) {
      mostrarToast(
        "Error",
        "Las fechas de inicio y fin son requeridas",
        "error",
      );
      return false;
    }

    if (new Date(formData.fechaInicio) >= new Date(formData.fechaFin)) {
      mostrarToast(
        "Error",
        "La fecha de inicio debe ser anterior a la de fin",
        "error",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      setConfirmConfig({
        open: true,
        title: "Confirmar creación de cupón",
        message: `¿Crear cupón "${formData.nombre}" con descuento de ${
          formData.porcentaje || formData.monto
        }?`,
      });
    }
  };

  const procesarCreacion = async () => {
    setLoading(true);
    setConfirmConfig({ ...confirmConfig, open: false });

    try {
      const cuponParaEnviar = {
        nombre: formData.nombre,
        porcentaje: formData.porcentaje
          ? parseFloat(formData.porcentaje)
          : null,
        monto: formData.monto ? parseFloat(formData.monto) : null,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
      };

      await crearCupon(cuponParaEnviar, token);
      mostrarToast("✅ Éxito", "Cupón creado exitosamente", "success");

      // Limpiar formulario
      setFormData({
        nombre: "",
        porcentaje: "",
        monto: "",
        fechaInicio: "",
        fechaFin: "",
      });
    } catch (error) {
      mostrarToast(
        "❌ Error",
        `No se pudo crear el cupón: ${error.message}`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-descuentos">
      <h3>Crear Nuevo Cupón de Descuento</h3>

      <form onSubmit={handleSubmit} className="cupon-form">
        <div className="form-grid-2">
          <div className="form-field">
            <label htmlFor="nombre">Nombre del Cupón *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: CINE20"
              disabled={loading}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="porcentaje">Porcentaje de Descuento (%)</label>
            <input
              type="number"
              id="porcentaje"
              name="porcentaje"
              value={formData.porcentaje}
              onChange={handleChange}
              placeholder="Ej: 20"
              min="0"
              max="100"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="monto">Monto de Descuento ($)</label>
            <input
              type="number"
              id="monto"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              placeholder="Ej: 500"
              min="0"
              step="0.01"
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="fechaInicio">Fecha de Inicio *</label>
            <input
              type="date"
              id="fechaInicio"
              name="fechaInicio"
              value={formData.fechaInicio}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="fechaFin">Fecha de Fin *</label>
            <input
              type="date"
              id="fechaFin"
              name="fechaFin"
              value={formData.fechaFin}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creando..." : "✅ Crear Cupón"}
          </button>
        </div>
      </form>

      <Toast
        open={toastConfig.open}
        title={toastConfig.title}
        description={toastConfig.description}
        variant={toastConfig.variant}
        onClose={() => setToastConfig({ ...toastConfig, open: false })}
      />

      <ConfirmModal
        open={confirmConfig.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel="Crear"
        cancelLabel="Cancelar"
        onConfirm={procesarCreacion}
        onCancel={() => setConfirmConfig({ ...confirmConfig, open: false })}
      />
    </div>
  );
}
