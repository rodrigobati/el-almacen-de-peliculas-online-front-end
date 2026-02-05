# UI alert to toast replacement

## Summary

Native browser alerts were used when adding items to the cart. These alerts are blocking and feel out of place in the UI.

## Root cause

`window.alert()` was called in the add-to-cart flow in the product card component.

## Solution

A lightweight, non-blocking toast component was added and wired into the add-to-cart success and error paths. It includes a short enter/exit animation and an Escape dismiss for accessibility. This avoids new dependencies while keeping UX consistent.

## Files changed

- src/components/ProductCard.jsx
- src/components/Toast.jsx
- src/styles.css

## Key snippets

**Toast component**

```jsx
export default function Toast({
  open,
  message,
  variant,
  onClose,
  duration = 3000,
}) {
  if (!open) return null;
  return (
    <div
      className={`toast toast-${variant}`}
      role="status"
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}
```

**Add-to-cart flow**

```jsx
await agregarAlCarrito(accessToken, {
  peliculaId: item.id,
  titulo: title,
  precio: price,
  cantidad: 1,
});
showToast("success", "Agregado al carrito");
```

```jsx
const errorMessage = err?.message
  ? `Error al agregar al carrito: ${err.message}`
  : "Error al agregar al carrito";
showToast("error", errorMessage);
```

## Manual test

1. Open the catalog page.
2. Click "Agregar al carrito" on any movie.
3. Expect a toast success message, no browser alert.
4. Disable auth or break the request to force an error.
5. Expect a toast error message with the backend text or status.
