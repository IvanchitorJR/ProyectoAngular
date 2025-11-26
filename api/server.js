import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import catalogoRoutes from './routes/catalogoRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();

// Configuración CORS más específica
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Middleware para logs de todas las peticiones
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - Body:`, req.body);
  next();
});

//Rutas
// Montar las rutas del catálogo en /api para exponer /api/productos
app.use('/api', catalogoRoutes);
app.use('/api/auth', authRoutes);

//Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});