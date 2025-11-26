import express from 'express';
import cors from 'cors';
import catalogoRoutes from './routes/catalogoRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

//Middleware
app.use(cors());
app.use(express.json());

//Rutas
// Montar las rutas del catálogo en /api para exponer /api/productos
app.use('/api', catalogoRoutes);
app.use('/api/auth', authRoutes);

export default app;
