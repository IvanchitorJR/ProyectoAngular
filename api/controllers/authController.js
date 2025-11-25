import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { User } from '../models/user.js';


// Configurar el transporter de nodemailer
const createTransporter = () => {
  // Si tienes configuración SMTP en .env, úsala
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Fallback: usar Ethereal Email para testing
  return nodemailer.createTransporter({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: "maddison53@ethereal.email",
      pass: "jn7jnAPss4f63QBp6D",
    },
  });
};

// Función para enviar correo
const sendResetEmail = async (email, token) => {
  try {
    const transporter = createTransporter();
    
    const from = process.env.SMTP_USER || '"Sistema de Recuperación" <maddison53@ethereal.email>';
    
    const mailOptions = {
      from: from,
      to: email,
      subject: "🔒 Código de Verificación - Recuperar Contraseña",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #059669; margin-bottom: 10px;">Recuperar Contraseña</h1>
            <p style="color: #64748b; font-size: 16px;">Usa el siguiente código para restablecer tu contraseña</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 10px; padding: 30px; text-align: center; margin: 30px 0;">
            <h2 style="color: #374151; margin-bottom: 15px;">Tu código de verificación:</h2>
            <div style="font-size: 36px; font-weight: bold; color: #059669; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${token}
            </div>
            <p style="color: #64748b; margin-top: 15px; font-size: 14px;">
              Este código expira en <strong>15 minutos</strong>
            </p>
          </div>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
            <p style="color: #dc2626; margin: 0; font-size: 14px;">
              <strong>Importante:</strong> Si no solicitaste este cambio de contraseña, ignora este correo. 
              Tu cuenta permanece segura.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Este es un correo automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado exitosamente:", info.messageId);
    
    // Si usas Ethereal, mostrar URL de preview
    if (info.preview) {
      console.log("Preview URL (Ethereal):", nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando correo:", error);
    return { success: false, error: error.message };
  }
};

// Solicitar recuperación de contraseña
export const forgotPassword = async (req, res) => {
  try {
    const { correo } = req.body;
    
    if (!correo) {
      return res.status(400).json({ message: 'Correo requerido' });
    }

    // Buscar usuario
    const user = await User.findByEmail(correo);
    if (!user) {
      return res.status(404).json({ message: 'No existe una cuenta con ese correo electrónico' });
    }

    // Generar código de 6 dígitos y expiración (15 minutos)
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Guardar token en base de datos
    await User.setResetToken(correo, token, expires);

    // Intentar enviar correo
    const emailResult = await sendResetEmail(correo, token);
    
    if (emailResult.success) {
      console.log(`Código de verificación enviado a ${correo}: ${token}`);
      res.json({ 
        message: 'Código de verificación enviado a tu correo electrónico',
        success: true 
      });
    } else {
      // Si falla el envío, mostrar código en consola como fallback
      console.log(`Código de verificación para ${correo}: ${token}`);
      console.log('Error enviando correo:', emailResult.error);
      res.json({ 
        message: 'Código generado (revisar consola del servidor - SMTP no configurado)',
        code: token, // Solo para desarrollo
        warning: true 
      });
    }

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Resetear contraseña usando código de verificación
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Código de verificación y nueva contraseña son requeridos' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Buscar usuario por token
    const user = await User.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ message: 'Código de verificación inválido o incorrecto' });
    }
    
    // Verificar si el token ha expirado
    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ message: 'El código de verificación ha expirado. Solicita uno nuevo.' });
    }
    
    // Actualizar contraseña y limpiar tokens
    await User.updatePasswordByToken(token, newPassword);
    
    console.log(`Contraseña actualizada exitosamente para usuario: ${user.correo}`);
    
    res.json({ 
      message: 'Contraseña actualizada exitosamente',
      success: true 
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar la contraseña' });
  }
};

// Registrar nuevo usuario
export const register = async (req, res) => {
  try {
    const { nombre, correo, password, tipo } = req.body;

    // Validación de campos requeridos
    if (!nombre || !correo || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son requeridos' });
    }

    // Validar tipo: debe ser 0 (cliente) o 1 (admin)
    const tipoUsuario = tipo === 1 ? 1 : 0;

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(correo);
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Crear nuevo usuario con el tipo especificado
    await User.create({ nombre, correo, password, tipo: tipoUsuario });
    res.status(201).json({ 
      message: 'Usuario registrado correctamente', 
      tipo: tipoUsuario 
    });
  } catch (error) {
    console.error('Error al registrar:', error);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
};

// Iniciar sesión
export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Buscar usuario
    const user = await User.findByEmail(correo);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Validar contraseña
    const isValid = await User.validatePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.correo, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        tipo: user.tipo
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};