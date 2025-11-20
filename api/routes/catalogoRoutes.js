import express from 'express';
import { obtenerProductos, agregarProducto, eliminarProducto, actualizarProducto, reducirStock } from '../controllers/catalogoController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

//Endpoints del catálogo
router.get('/productos', obtenerProductos);

// Rutas protegidas para administradores
router.post('/productos', verifyToken, requireAdmin, agregarProducto);
router.delete('/productos/:id', verifyToken, requireAdmin, eliminarProducto);
router.put('/productos/:id', verifyToken, requireAdmin, actualizarProducto);

// Endpoint público para reducir stock tras una compra (no requiere admin)
router.post('/productos/reducir-stock', reducirStock);

export default router;