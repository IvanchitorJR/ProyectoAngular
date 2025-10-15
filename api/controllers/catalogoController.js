import db from '../config/db.js';

//Obtener los productos
export const obtenerProductos = (req, res) => {
    const sql = 'SELECT * FROM productos';
    db.query(sql, (err, results) => {
        if(err){
            console.error("Error al obtener los productos:", err);
            return res.status(500).json({error: 'Error al obtener los productos'});
        }
        res.json(results);
    });
}