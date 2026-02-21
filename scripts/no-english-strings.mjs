import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const checks = [
  {
    file: "src/pages/CompraDetalle.jsx",
    forbidden: [
      "Purchase detail",
      "Loading purchase detail",
      "Could not load purchase detail",
      "Purchase not found",
      "Back to purchases",
      "Validating stock status",
      "Status:",
      "Date:",
      "Discount:",
      "No items found",
      "Qty:",
      "Unit:",
      "Go to cart"
    ]
  },
  {
    file: "src/pages/Compras.jsx",
    forbidden: [
      "Could not load purchases",
      "Loading purchases",
      "No purchases yet",
      "Purchase #",
      "View detail",
      "My purchases",
      "Go to cart",
      "Status:",
      "Date:",
      "Total:"
    ]
  },
  {
    file: "src/pages/Carrito.jsx",
    forbidden: [
      "Your session is authenticated but token is unavailable",
      "Sign in again"
    ]
  },
  {
    file: "src/pages/Catalogo.jsx",
    forbidden: ["Ocultar Reviews", "Ver Reviews"]
  },
  {
    file: "src/pages/Reviews.jsx",
    forbidden: [
      "⭐ Reviews",
      "reviews)",
      "Escribir una review",
      "Tu review",
      "Publicar Review",
      "Inicia sesión para escribir una review",
      "Cargando reviews..."
    ]
  },
  {
    file: "src/api/ventas.js",
    forbidden: [
      "Your cart is empty",
      "Invalid discount",
      "Purchase not found",
      "You must sign in to continue",
      "Authentication token is missing",
      "Could not connect to the sales service",
      "Unexpected error"
    ]
  },
  {
    file: "src/i18n/esAR.js",
    required: [
      'purchaseTitle: "Compra #{{id}}"',
      'backToPurchases: "Volver a compras"',
      'statusLabel: "Estado"',
      'dateLabel: "Fecha"',
      'subtotalLabel: "Subtotal"',
      'discountLabel: "Descuento"',
      'totalLabel: "Total"',
      'itemsTitle: "Ítems"',
      'validatingStock: "Validando stock..."',
      'goToCart: "Ir al carrito"'
    ]
  }
];

const errors = [];

for (const check of checks) {
  const filePath = path.join(root, check.file);
  const content = fs.readFileSync(filePath, "utf8");

  for (const token of check.forbidden ?? []) {
    if (content.includes(token)) {
      errors.push(`${check.file}: contiene token en inglés prohibido -> ${token}`);
    }
  }

  for (const token of check.required ?? []) {
    if (!content.includes(token)) {
      errors.push(`${check.file}: falta token esperado -> ${token}`);
    }
  }
}

if (errors.length > 0) {
  console.error("❌ Falló la validación de localización:\n");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("✅ Validación de localización OK: no se detectaron cadenas en inglés prohibidas.");
