Inventory & Admin API notes

- On startup the API will attempt to ensure the `productos` table has a `cantidad` INT DEFAULT 0 column.
- Manual SQL migration is available in `api/sql/add_cantidad_to_productos.sql`.

New admin endpoints (require a valid JWT of an admin user):

- POST `/api/productos`  -> add product. Body: `{ nombre, precio, imagen?, descripcion?, cantidad? }`
- DELETE `/api/productos/:id` -> delete product by id
- PUT `/api/productos/:id` -> update product description and/or quantity. Body: `{ descripcion?, cantidad? }`

Authentication:
- Login endpoint remains at `/api/auth/login`. The JWT payload includes `tipo` (admin users should have `tipo === 1`).
- The API provides `verifyToken` and `requireAdmin` middleware in `api/middleware/authMiddleware.js`.

Frontend:
- `src/app/servicios/producto.ts` adds `addProducto`, `deleteProducto`, `updateProducto` methods which attach the JWT stored by `AuthService`.

How to apply manually:

1. If you prefer to run migration manually, run the SQL in `api/sql/add_cantidad_to_productos.sql` against `ecommerce_bd`.
2. Start the API: from `api` folder run `npm install` then `npm start`.
