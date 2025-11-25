import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Error al conectar:', err);
        return;
    }
    else {
        console.log('Conectado.');
    }
});

// Ensure `cantidad` column exists in `productos` table (safe startup migration)
const ensureCantidadColumn = () => {
    const checkSql = "SHOW COLUMNS FROM productos LIKE 'cantidad'";
    db.query(checkSql, (err, results) => {
        if (err) {
            // If productos table doesn't exist, skip silently (other migrations should create it)
            console.warn('No se pudo comprobar columna `cantidad` (tabla productos ausente?):', err.code || err.message);
            return;
        }

        if (results.length === 0) {
            const alter = 'ALTER TABLE productos ADD COLUMN cantidad INT DEFAULT 0';
            db.query(alter, (err2) => {
                if (err2) {
                    console.error('Error al añadir columna `cantidad` a productos:', err2);
                } else {
                    console.log('Columna `cantidad` añadida a la tabla `productos`.');
                }
            });
        } else {
            // Column already exists
            // console.log('Columna `cantidad` ya existe en `productos`.');
        }
    });
};

ensureCantidadColumn();

export default db;