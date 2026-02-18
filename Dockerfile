# ==============================================================
# Multi-stage build para React + Vite
# ==============================================================

# Stage 1: Build de la aplicación React
FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:9500/api
ARG VITE_VENTAS_API_BASE_URL=http://localhost:9500
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_VENTAS_API_BASE_URL=${VITE_VENTAS_API_BASE_URL}

# Copiar package files
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build para producción
RUN npm run build

# Stage 2: Nginx para servir archivos estáticos
FROM nginx:1.27-alpine

# Copiar archivos compilados desde stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Nginx se inicia automáticamente con CMD por defecto
CMD ["nginx", "-g", "daemon off;"]
