# Carrito de Compras - Integración Front-end

## 📋 Resumen de la Implementación

Se implementó la UI completa del carrito de compras en React siguiendo los patrones existentes del proyecto.

## 📦 Archivos Creados

### API Layer

- **`src/api/carrito.js`** - Módulo de API siguiendo el patrón de `movies.js`:
  - `fetchCarrito(clienteId)` - Obtiene el carrito del cliente
  - `agregarAlCarrito(clienteId, pelicula)` - Agrega/incrementa película en el carrito
  - `eliminarDelCarrito(clienteId, peliculaId)` - Elimina película del carrito
  - Adapters DTO → UI: `mapCarritoDTOtoUI()` y `mapItemDTOtoUI()`

### Pages

- **`src/pages/Carrito.jsx`** - Página del carrito con:
  - Listado de items (título, precio, cantidad, subtotal)
  - Total del carrito
  - Botón eliminar por item
  - Estados: loading, error, carrito vacío

### Modificaciones

#### `src/components/ProductCard.jsx`

- Agregado botón "🛒 Agregar al carrito"
- Integración con `useAuth()` para obtener `clienteId`
- Feedback visual: alert de confirmación
- Estado de carga durante la operación
- Click en imagen/título abre detalle (comportamiento original preservado)

#### `src/components/UserMenu.jsx`

- Agregada opción "🛒 Mi Carrito" en el menú desplegable
- Navegación a `/carrito` mediante `useNavigate()`

#### `src/App.jsx`

- Agregada ruta `/carrito` con el componente `Carrito`
- Import del componente `Carrito`

#### `src/styles.css`

- Estilos para `.btn-add-to-cart` (botón en tarjetas)
- Estilos para `.carrito-page` y componentes relacionados
- Layout responsive para móviles

## 🎯 Funcionalidades Implementadas

### Historia de Usuario Completa

✅ **Ver carrito**: Cliente puede ver todos los productos en su carrito con detalles completos  
✅ **Eliminar productos**: Botón eliminar por cada item con confirmación  
✅ **Agregar desde catálogo**: Botón visible en cada tarjeta de película  
✅ **Navegación**: Acceso al carrito desde menú de usuario

### Características Técnicas

- ✅ Adaptadores DTO → UI (no expone DTOs crudos a componentes)
- ✅ Uso de `user?.preferred_username` como `clienteId`
- ✅ Manejo de estados: loading, error, vacío
- ✅ Sin librerías adicionales
- ✅ Estilos consistentes con el proyecto
- ✅ Responsive design

## 🔧 Configuración Requerida

### Backend (Ventas)

Asegúrate de que el backend de Ventas esté corriendo con los endpoints:

- `GET /api/clientes/{clienteId}/carrito`
- `POST /api/clientes/{clienteId}/carrito/items`
- `DELETE /api/clientes/{clienteId}/carrito/items/{peliculaId}`

Puerto por defecto de Spring Boot: **8080**

### Frontend

Crear archivo `.env` en la raíz del proyecto front-end:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

O ajustar según tu configuración de API Gateway si existe.

## 🚀 Ejecución

### 1. Backend (Ventas)

```bash
cd el-almacen-de-peliculas-online-ventas
mvn spring-boot:run
```

### 2. Frontend

```bash
cd el-almacen-de-peliculas-online-front-end
npm install  # si es la primera vez
npm run dev
```

### 3. Acceder

- Frontend: http://localhost:5173 (por defecto Vite)
- Backend: http://localhost:8080

## 📝 Flujo de Usuario

1. **Iniciar sesión** (Keycloak)
2. **Navegar al catálogo** (página principal)
3. **Agregar películas** haciendo click en "🛒 Agregar al carrito"
4. **Ver carrito** desde menú de usuario (⚙️) → "🛒 Mi Carrito"
5. **Eliminar items** si es necesario
6. **Ver total actualizado** en tiempo real

## 🎨 Decisiones de Diseño

### ¿Por qué en UserMenu y no en el header?

- Menor impacto visual
- Consistente con el patrón existente de navegación
- Fácil acceso sin saturar el header

### ¿Por qué alert() para confirmación?

- Sin librerías adicionales (requisito)
- Feedback inmediato
- Patrón estándar reconocible

### Separación imagen/título vs botón

- Click en imagen/título: abre detalle (preservado)
- Click en botón: agrega al carrito
- UX clara y sin ambigüedad

## 🔒 Seguridad

- Validación de `clienteId` en ambos lados (front y back)
- Usuario debe estar autenticado para agregar items
- Backend valida todas las operaciones

## 🧪 Testing Sugerido

1. Agregar película sin login → debe mostrar mensaje
2. Agregar película con login → debe agregarse
3. Agregar misma película 2 veces → debe incrementar cantidad
4. Eliminar película → debe actualizar total
5. Carrito vacío → debe mostrar mensaje y botón al catálogo
6. Navegación → todas las rutas deben funcionar

## 🐛 Troubleshooting

### Error al agregar al carrito

- Verificar que el backend esté corriendo
- Verificar `VITE_API_BASE_URL` en `.env`
- Abrir consola del navegador para ver detalles del error

### No aparece el botón "Agregar al carrito"

- Verificar que `ProductCard.jsx` tenga los cambios
- Hacer rebuild: `npm run build` y reiniciar dev server

### El carrito no carga

- Verificar que estés autenticado
- Verificar endpoint en `src/api/config.js`
- Verificar que el backend tenga `InMemoryCarritoRepository` registrado
