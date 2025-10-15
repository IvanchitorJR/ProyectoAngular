import express from 'express';
import { obtenerProductos } from '../controllers/catalogoController.js';

const router = express.Router();

//Endpoints del catálogo
router.get('/productos', obtenerProductos);

export default router;