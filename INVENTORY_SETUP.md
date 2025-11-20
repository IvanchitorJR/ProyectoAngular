# Sistema de Gestión de Inventario - Guía Completa

## ¿Qué se implementó?

### 1. **Base de Datos**
- ✅ Columna `cantidad INT DEFAULT 0` añadida a la tabla `productos`
- ✅ Migración automática al arrancar el servidor (crea la columna si no existe)
- ✅ Script SQL manual disponible en `api/sql/add_cantidad_to_productos.sql`

### 2. **Backend API (Node.js/Express)**

#### Nuevos Endpoints:
- `POST /api/productos` (requiere admin) - Agregar producto
- `PUT /api/productos/:id` (requiere admin) - Actualizar descripción/cantidad
- `DELETE /api/productos/:id` (requiere admin) - Eliminar producto
- `POST /api/productos/reducir-stock` (público) - Decrementar stock tras compra

#### Seguridad:
- JWT token requerido para modificaciones (excepto decrementar stock)
- Middleware `requireAdmin` verifica que el usuario tenga `tipo === 1`
- Validación de entrada en todos los endpoints

### 3. **Frontend Angular**

#### Componentes:
- `AdminComponent` (`/admin`) - UI principal de gestión de inventario
  - Tabla de productos con acciones (editar/eliminar)
  - Formulario para agregar productos
  - Edición inline de descripción y cantidad

- `AdmpanelComponent` (`/admpanel`) - Panel de bienvenida
  - Redirección a `/admin` para gestión completa

#### Servicios:
- `ProductoService` - Métodos HTTP para CRUD de productos
  - `getProductos()` - Obtener lista (público)
  - `addProducto()` - Agregar (admin)
  - `updateProducto()` - Actualizar (admin)
  - `deleteProducto()` - Eliminar (admin)
  - `decrementStock()` - Reducir stock tras compra

#### Flujo de Compra PayPal:
- Al autorizar el pago en PayPal, se llama a `/api/productos/reducir-stock`
- Los productos comprados se descuentan del inventario
- El carrito se vacía y se exporta recibo XML

---

## Cómo Probar

### Requisitos Previos
1. Base de datos `ecommerce_bd` debe existir
2. Tabla `productos` con campos: `id`, `nombre`, `precio`, `imagen`, `descripcion`, `cantidad`
3. Tabla `usuarios` con campos: `id`, `nombre`, `correo`, `password`, `tipo` (1=admin, 0=cliente)
4. `.env` configurado correctamente:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=tu_password
   DB_NAME=ecommerce_bd
   JWT_SECRET=tu_secret_key
   PORT=4000
   ```

### Pasos para Probar

#### 1. Arrancar el servidor API
```powershell
cd c:\Users\ivand\OneDrive\Escritorio\PruebasAngular\ProyectoAngular\api
npm install
npm start
```

Deberías ver:
```
[dotenv] injecting env
Servidor corriendo en el puerto 4000
Conectado.
```

#### 2. Arrancar la aplicación Angular
```powershell
cd c:\Users\ivand\OneDrive\Escritorio\PruebasAngular\ProyectoAngular
npm install
npm start
```

#### 3. Login como Administrador
- Navega a `http://localhost:4200/login`
- Usa credenciales de un usuario con `tipo = 1`:
  - Ejemplo: correo: `admin@example.com`, password: `admin123`
- Deberías ser redirigido a `/admpanel`

#### 4. Acceder al Gestor de Inventario
- En el panel de bienvenida, haz clic en **"Ir al Gestor de Productos"**
- O navega directamente a `http://localhost:4200/admin`

#### 5. Pruebas de Funcionalidad

**Agregar Producto:**
1. Rellena el formulario:
   - Nombre: "Lámpara LED"
   - Precio: 25.50
   - Cantidad: 100
   - Imagen: `https://via.placeholder.com/300`
   - Descripción: "Lámpara LED moderna"
2. Haz clic en **"Agregar Producto"**
3. Verifica que aparezca en la tabla

**Editar Producto:**
1. Haz clic en el botón **"✏️"** (lápiz) en la fila de un producto
2. Modifica la cantidad o descripción
3. Haz clic en **"💾"** (guardar)
4. Verifica el cambio en la tabla

**Eliminar Producto:**
1. Haz clic en el botón **"🗑️"** (eliminar) de un producto
2. Confirma la eliminación en el diálogo
3. Verifica que se elimine de la tabla

#### 6. Probar Compra y Decremento de Stock
1. Logout del panel admin
2. Login como cliente (usuario con `tipo = 0`)
3. Navega a `/catalogo`
4. Agregar productos al carrito
5. Ir al carrito y proceder a PayPal
6. Usar credenciales de sandbox de PayPal (si tienes configuradas)
7. Tras autorizar el pago:
   - El stock se decrementa automáticamente
   - Se exporta el recibo
   - El carrito se vacía
8. Vuelve a `/admin` como admin y verifica que las cantidades se redujeron

---

## API Endpoints - Ejemplos cURL

### Obtener Productos (público)
```bash
curl http://localhost:4000/api/productos
```

### Agregar Producto (requiere token admin)
```bash
curl -X POST http://localhost:4000/api/productos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "nombre": "Producto Test",
    "precio": 19.99,
    "imagen": "https://...",
    "descripcion": "Descripción",
    "cantidad": 50
  }'
```

### Actualizar Producto (requiere token admin)
```bash
curl -X PUT http://localhost:4000/api/productos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "descripcion": "Nueva descripción",
    "cantidad": 25
  }'
```

### Eliminar Producto (requiere token admin)
```bash
curl -X DELETE http://localhost:4000/api/productos/1 \
  -H "Authorization: Bearer TOKEN"
```

### Reducir Stock (público - tras compra)
```bash
curl -X POST http://localhost:4000/api/productos/reducir-stock \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "id": 1, "cantidad": 2 },
      { "id": 2, "cantidad": 1 }
    ]
  }'
```

---

## Estructura de Archivos Modificados/Creados

### Backend
```
api/
├── middleware/
│   └── authMiddleware.js         (NEW - JWT & role validation)
├── controllers/
│   ├── catalogoController.js     (UPDATED - nuevos métodos)
│   └── authController.js         (existente)
├── routes/
│   └── catalogoRoutes.js         (UPDATED - nuevas rutas)
├── config/
│   └── db.js                     (UPDATED - startup migration)
├── sql/
│   └── add_cantidad_to_productos.sql (NEW - migración manual)
└── README.md                     (NEW)
```

### Frontend
```
src/app/
├── admin/
│   ├── admin.ts                  (UPDATED - lógica CRUD)
│   ├── admin.html                (UPDATED - tabla + formulario)
│   └── admin.css
├── admpanel/
│   ├── admpanel.ts               (UPDATED - agregar RouterLink)
│   ├── admpanel.html             (UPDATED - botón a /admin)
│   └── admpanel.css
├── paypal/
│   └── paypal.ts                 (UPDATED - decrementStock en pago)
├── servicios/
│   └── producto.ts               (UPDATED - métodos admin + decrementStock)
├── modelos/
│   └── producto.ts               (OK - ya incluye cantidad?)
└── app.ts                        (existente)
```

---

## Troubleshooting

### "La página de admin está vacía"
- ✅ **Solucionado**: Ahora tienes un botón en el panel de bienvenida que navega a `/admin`
- Verifica que hayas hecho login como admin (tipo = 1)
- Abre la consola del navegador (F12) para ver errores

### "Error: no tienes permisos"
- Asegúrate de que el usuario tiene `tipo = 1` en la BD
- Verifica que el token JWT incluye `tipo` en el payload (rev. `authController.login`)

### "La tabla de productos no carga"
- Verifica que el servidor API está corriendo en `http://localhost:4000`
- Abre la consola (F12) y revisa Network → `/api/productos`
- Comprueba que hay productos en la BD

### "Stock no se decrementa tras pago"
- Abre la consola (F12) en Networks y revisa si llega a `/api/productos/reducir-stock`
- Verifica que PayPal dispara `onClientAuthorization` (log en consola)
- Si falla, el carrito se vacía de todas formas pero se guarda el recibo localmente

---

## Próximas Mejoras Sugeridas

1. **Transacciones atomizadas**: Usar MySQL transactions en `reducirStock`
2. **Webhooks de PayPal**: Validar pagos en el backend (más seguro)
3. **Historial de cambios**: Auditoría de quién modificó qué y cuándo
4. **Notificaciones**: Email o SMS cuando stock baja de un umbral
5. **Reportes**: Dashboard con gráficos de ventas y rotación de inventario

---

¡Sistema listo para usar! 🎉
