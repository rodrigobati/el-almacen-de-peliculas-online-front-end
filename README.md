# El Almacén de Películas — Front-end

## Estado del componente

El front-end no es una vertical backend. Es la SPA React/Vite que consume las APIs expuestas por el API Gateway.

### Servicios HTTP que expone

No expone servicios HTTP de negocio. En desarrollo Vite sirve assets de la SPA; en despliegue Nginx sirve archivos estaticos.

### Eventos que publica o consume

No publica ni consume eventos de dominio. Consume HTTP de Catalogo, Ventas, Descuentos, Rating y autenticacion con Keycloak.

Proyecto React (Vite) inicial generado manualmente.

Install y run:

1. Instalar dependencias:

   npm install

2. Arrancar servidor de desarrollo:

   npm run dev

El servidor por defecto usará Vite y abrirá la app en localhost.
