// src/components/Modal.jsx
import React, { useEffect } from "react";

export default function Modal({
  open = false,
  title = "",
  message = "",
  onClose,
  primaryActionLabel = "",
  onPrimaryAction = null,
}) {
  // Cerrar modal con tecla Escape
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby="modal-message"
      >
        {title && (
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
        )}
        <p id="modal-message" className="modal-message">
          {message}
        </p>
        <div className="modal-actions">
          {onPrimaryAction && primaryActionLabel && (
            <button
              onClick={onPrimaryAction}
              className="modal-btn modal-btn-primary"
            >
              {primaryActionLabel}
            </button>
          )}
          <button onClick={onClose} className="modal-btn modal-btn-secondary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
