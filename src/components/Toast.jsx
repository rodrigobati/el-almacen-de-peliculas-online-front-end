import React, { useEffect, useRef, useState } from "react";

export default function Toast({
  open = false,
  title = "",
  description = "",
  variant = "success",
  onClose,
  duration = 3000
}) {
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    if (open) {
      setIsClosing(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const dismiss = () => {
    if (isClosing) return;
    setIsClosing(true);

    closeTimeoutRef.current = setTimeout(() => {
      setIsClosing(false);
      if (onClose) onClose();
    }, 200);
  };

  useEffect(() => {
    if (!open) return;

    const timerId = setTimeout(() => {
      dismiss();
    }, duration);

    return () => clearTimeout(timerId);
  }, [open, duration]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        dismiss();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  const liveMode = variant === "error" ? "assertive" : "polite";

  return (
    <div
      className={`toast toast-${variant} ${isClosing ? "toast-exit" : "toast-enter"}`}
      role="status"
      aria-live={liveMode}
      aria-atomic="true"
    >
      <div className="toast-icon" aria-hidden="true">
        {variant === "error" ? "!" : "✓"}
      </div>
      <div className="toast-content">
        <div className="toast-title">{title}</div>
        {description ? (
          <div className="toast-description">{description}</div>
        ) : null}
      </div>
      <button
        type="button"
        className="toast-close"
        aria-label="Dismiss notification"
        onClick={dismiss}
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
