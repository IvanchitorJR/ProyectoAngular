import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        //Verificar si el usuario ya existe
        const existingUser = await User.findByEmail(correo);
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        //Crear nuevo usuario
        await User.create({ nombre, correo, password });
        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error al registrar:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
};

export const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        //Buscar usuario
        const user = await User.findByEmail(correo);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        //Validar contraseña (sin encriptación)
        const isValid = await User.validatePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        //Generar token
        const token = jwt.sign(
            { id: user.id, email: user.correo },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo
            }
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ message: 'Error al iniciar sesión' });
    }
};