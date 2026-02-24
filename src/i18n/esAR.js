const esAR = {
  navigation: {
    admin: "Administración",
    cart: "Carrito",
    purchases: "Compras",
    discounts: "Cupones de descuento"
  },
  common: {
    loading: "Cargando…",
    errorPrefix: "Error",
    technicalDetails: "Detalles técnicos",
    error: {
      generic: "Ocurrió un error inesperado.",
      network: "No se pudo conectar con el servicio.",
      unauthorized: "Tu sesión no es válida. Iniciá sesión nuevamente.",
      forbidden: "No tenés permisos para realizar esta acción.",
      server: "El servicio está temporalmente no disponible.",
      validation: "Hay datos inválidos en la solicitud."
    }
  },
  catalog: {
    reviewsToggleShow: "Ver reseñas",
    reviewsToggleHide: "Ocultar reseñas"
  },
  cart: {
    title: "Mi carrito",
    backToCatalog: "Volver al catálogo",
    viewPurchases: "Ver compras",
    loading: "Cargando carrito...",
    empty: "Tu carrito está vacío",
    goToCatalog: "Ir al catálogo",
    authNoToken: "Tu sesión está autenticada, pero no hay token disponible.",
    authSignInAgain: "Iniciar sesión nuevamente",
    authWithDevClient: "Iniciá sesión o cargá un cliente de desarrollo para usar el carrito.",
    retryWithClientId: "Reintentar con clienteId",
    removeOneUnit: "Quitar una unidad",
    remove: "Eliminar",
    summarySubtotal: "Subtotal:",
    summaryDiscount: "Descuento:",
    summaryTotal: "Total:",
    confirmPurchase: "Confirmar compra",
    confirmingPurchase: "Confirmando..."
  },
  purchases: {
    title: "Mis compras",
    loading: "Cargando compras...",
    empty: "Todavía no tenés compras.",
    loadError: "No se pudieron cargar las compras.",
    purchaseTitle: "Compra #{{id}}",
    statusLabel: "Estado",
    dateLabel: "Fecha",
    totalLabel: "Total",
    viewDetail: "Ver detalle",
    goToCart: "Ir al carrito"
  },
  purchaseDetail: {
    pageTitle: "Detalle de compra",
    purchaseTitle: "Compra #{{id}}",
    loading: "Cargando detalle de compra...",
    loadError: "No se pudo cargar el detalle de la compra.",
    notFound: "No se encontró la compra.",
    backToPurchases: "Volver a compras",
    validatingStock: "Validando stock...",
    statusLabel: "Estado",
    dateLabel: "Fecha",
    subtotalLabel: "Subtotal",
    discountLabel: "Descuento",
    totalLabel: "Total",
    itemsTitle: "Ítems",
    emptyItems: "No se encontraron ítems.",
    itemFallbackTitle: "Película #{{id}}",
    qtyLabel: "Cantidad: {{value}}",
    unitPriceLabel: "Precio unitario: {{value}}",
    goToCart: "Ir al carrito"
  },
  purchaseStatus: {
    CONFIRMADA: "Confirmada",
    RECHAZADA: "Rechazada",
    PENDIENTE: "Pendiente",
    DESCONOCIDO: "Desconocido"
  },
  purchaseRejection: {
    STOCK_INSUFICIENTE:
      "Compra rechazada por falta de stock. El importe fue reintegrado a tu billetera.",
    DEFAULT:
      "La compra fue rechazada. Revisá el detalle para más información."
  },
  reviews: {
    title: "⭐ Reseñas",
    totalCount: "({{count}} reseñas)",
    write: "✍️ Escribir una reseña",
    alreadyReviewed: "✓ Ya dejaste tu reseña para esta película",
    yourReview: "Tu reseña",
    submit: "Publicar reseña",
    submitting: "Enviando...",
    loginToWrite: "Iniciá sesión para escribir una reseña",
    loading: "Cargando reseñas...",
    empty: "Aún no hay reseñas para esta película.",
    beFirst: "¡Sé el primero en escribir una!",
    anonymousUser: "Usuario anónimo",
    sendError: "Error al enviar la reseña"
  },
  sales: {
    error: {
      CARRITO_VACIO: "Tu carrito está vacío.",
      DESCUENTO_INVALIDO: "El descuento es inválido.",
      COMPRA_NO_ENCONTRADA: "No se encontró la compra.",
      CLIENTE_NO_AUTENTICADO: "Debés iniciar sesión para continuar.",
      STOCK_INSUFICIENTE: "No hay stock suficiente para completar la compra."
    }
  }
};

export default esAR;
