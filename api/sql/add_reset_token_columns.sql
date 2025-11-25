-- Agregar columnas para reset de contraseña
-- Este script agrega las columnas necesarias para el sistema de recuperación de contraseña

-- Para tabla 'usuarios' (si existe)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token VARCHAR(6) NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL;

-- Para tabla 'users' (si existe como fallback)
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(6) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires DATETIME NULL;

-- Crear índices para mejorar la performance de búsqueda por token
CREATE INDEX IF NOT EXISTS idx_usuarios_reset_token ON usuarios(reset_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);