import crypto from 'crypto';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Solicitar recuperación de contraseña (genera token y lo guarda)
export const forgotPassword = async (req, res) => {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ message: 'Correo requerido' });
    try {
        const user = await User.findByEmail(correo);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        // Generar token simple y expiración (ej: 1 hora)
        const token = crypto.randomBytes(20).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
        await User.setResetToken(correo, token, expires);
        // Por seguridad no devolvemos el token en la respuesta en producción.
        // Para pruebas lo registramos en consola del servidor (puedes reemplazar por envío de correo).
        console.log(`Reset token for ${correo}: ${token}`);

        // Intentar enviar el token por correo si hay configuración SMTP
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        if (smtpUser && smtpPass) {
            try {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'smtp.gmail.com',
                    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: smtpUser,
                        pass: smtpPass
                    }
                });

                const from = process.env.SMTP_FROM || smtpUser;
                const mailOptions = {
                    from,
                    to: correo,
                    subject: 'Recuperación de contraseña',
                    text: `Se solicitó la recuperación de contraseña. Usa este token para restablecer tu contraseña: ${token}\n
Token expira en 1 hora.`
                };

                await transporter.sendMail(mailOptions);
                return res.json({ message: 'Token de recuperación generado y enviado por correo.' });
            } catch (mailErr) {
                console.error('Error enviando email:', mailErr);
                return res.status(500).json({ message: 'Token generado pero error al enviar correo.' });
            }
        } else {
            console.warn('No SMTP configurado; token no enviado por correo. Configure SMTP_USER y SMTP_PASS.');
            return res.json({ message: 'Token generado (no enviado por correo: SMTP no configurado).' });
        }
    } catch (err) {
        console.error('Error en forgotPassword:', err);
        res.status(500).json({ message: 'Error al solicitar recuperación' });
    }
};

// Resetear contraseña usando token
export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token y nueva contraseña requeridos' });
    try {
        const user = await User.findByResetToken(token);
        if (!user) return res.status(400).json({ message: 'Token inválido' });
        if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
            return res.status(400).json({ message: 'Token expirado' });
        }
        await User.updatePasswordByToken(token, newPassword);
        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (err) {
        console.error('Error en resetPassword:', err);
        res.status(500).json({ message: 'Error al resetear contraseña' });
    }
};

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