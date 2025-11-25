import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token requerido' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = decoded;
        next();
    });
};

export const requireAdmin = (req, res, next) => {
    // Asumimos tipo === 1 significa administrador
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Usuario no autenticado' });
    if (user.tipo !== 1) return res.status(403).json({ message: 'Acceso reservado a administradores' });
    next();
};
