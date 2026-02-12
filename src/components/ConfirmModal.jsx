import React, { useEffect, useRef } from "react";

function getFocusableElements(container) {
  if (!container) return [];
  const selector =
    "button,[href],input,select,textarea,[tabindex]:not([tabindex='-1'])";
  return Array.from(container.querySelectorAll(selector)).filter(
    (element) => !element.hasAttribute("disabled") && !element.getAttribute("aria-hidden")
  );
}

export default function ConfirmModal({
  open = false,
  title = "Confirmar eliminación",
  message = "¿Eliminar esta película del carrito?",
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement;
    const focusable = getFocusableElements(modalRef.current);

    if (focusable.length > 0) {
      focusable[0].focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const elements = getFocusableElements(modalRef.current);
      if (elements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";

      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-message"
        ref={modalRef}
      >
        <h2 id="confirm-modal-title" className="modal-title">
          {title}
        </h2>
        <p id="confirm-modal-message" className="modal-message">
          {message}
        </p>
        <div className="modal-actions">
          <button
            type="button"
            onClick={onConfirm}
            className="modal-btn modal-btn-danger"
          >
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="modal-btn modal-btn-secondary"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
