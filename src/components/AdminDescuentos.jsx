import { useState, useEffect } from "react";
import { crearCupon, listarTodosCupones } from "../api/descuentos";
import { useAuth } from "../contexts/AuthContext";
import ConfirmModal from "./ConfirmModal";
import Toast from "./Toast";

export default function AdminDescuentos() {
  const { keycloak } = useAuth();
  const accessToken = keycloak?.token;
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creando, setCreando] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    monto: "",
    fechaInicio: "",
    fechaFin: "",
  });

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

  useEffect(() => {
    if (accessToken) {
      cargarCupones();
    }
  }, [accessToken]);

  const cargarCupones = async () => {
    try {
      setLoading(true);
      const datos = await listarTodosCupones(accessToken);
      setCupones(datos);
    } catch (error) {
      mostrarToast("Error", "No se pudieron cargar los cupones", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCrear = () => {
    setFormData({
      nombre: "",
      monto: "",
      fechaInicio: "",
      fechaFin: "",
    });
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setFormData({
      nombre: "",
      monto: "",
      fechaInicio: "",
      fechaFin: "",
    });
  };

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
        message: `¿Crear cupón "${formData.nombre}" con descuento de ${formData.monto}?`,
      });
    }
  };

  const procesarCreacion = async () => {
    setCreando(true);
    setConfirmConfig({ ...confirmConfig, open: false });

    try {
      const cuponParaEnviar = {
        nombre: formData.nombre,
        monto: formData.monto ? parseFloat(formData.monto) : null,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin,
      };

      await crearCupon(cuponParaEnviar, accessToken);
      mostrarToast("✅ Éxito", "Cupón creado exitosamente", "success");

      cerrarModal();
      cargarCupones(); // Recargar la lista
    } catch (error) {
      mostrarToast(
        "❌ Error",
        `No se pudo crear el cupón: ${error.message}`,
        "error",
      );
    } finally {
      setCreando(false);
    }
  };

  const esActivo = (cupon) => {
    const hoy = new Date();
    const inicio = new Date(cupon.fechaInicio);
    const fin = new Date(cupon.fechaFin);
    return hoy >= inicio && hoy <= fin;
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString("es-AR");
  };

  if (loading) {
    return (
      <div className="admin-descuentos">
        <p>Cargando cupones...</p>
      </div>
    );
  }

  return (
    <div className="admin-descuentos">
      <div className="admin-descuentos-header">
        <h3>Administrar Cupones de Descuento</h3>
        <button className="btn btn-primary" onClick={abrirModalCrear}>
          ➕ Crear Nuevo Cupón
        </button>
      </div>

      {cupones.length > 0 ? (
        <div className="cupones-lista">
          <table className="cupones-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Monto</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {cupones.map((cupon) => (
                <tr
                  key={cupon.id}
                  className={esActivo(cupon) ? "activo" : "inactivo"}
                >
                  <td className="cupon-nombre">{cupon.nombre}</td>
                  <td className="cupon-monto">${cupon.monto}</td>
                  <td>{formatearFecha(cupon.fechaInicio)}</td>
                  <td>{formatearFecha(cupon.fechaFin)}</td>
                  <td>
                    <span
                      className={`badge ${esActivo(cupon) ? "badge-activo" : "badge-inactivo"}`}
                    >
                      {esActivo(cupon) ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="sin-cupones">
          <p>No hay cupones creados aún.</p>
          <button className="btn btn-primary" onClick={abrirModalCrear}>
            Crear el primer cupón
          </button>
        </div>
      )}

      {/* Modal para crear cupón */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-cupon-form">
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
                    disabled={creando}
                    required
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
                    disabled={creando}
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
                    disabled={creando}
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
                    disabled={creando}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-cancelar"
                  onClick={cerrarModal}
                  disabled={creando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creando}
                >
                  {creando ? "Creando..." : "✅ Crear Cupón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
