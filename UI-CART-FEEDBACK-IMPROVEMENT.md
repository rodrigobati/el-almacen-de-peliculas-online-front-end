# Cart feedback improvement

## What was wrong

The cart feedback toast was too small and easy to miss in the bottom-right corner.

## What changed

A larger, top-centered notification was implemented with stronger contrast, an icon, and optional secondary text. It auto-dismisses after a few seconds and can be dismissed via the close button or Escape.

## Files changed

- src/components/ProductCard.jsx
- src/components/Toast.jsx
- src/styles.css

## How to test

1. Open the catalog page.
2. Click "Agregar al carrito" on any movie.
3. Expect a larger notification centered near the top with a success icon and a secondary line.
4. Force an error (expired token or network) and repeat.
5. Expect a prominent error notification with details.
