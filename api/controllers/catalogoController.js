import db from '../config/db.js';

//Obtener los productos
export const obtenerProductos = (req, res) => {
    const sql = 'SELECT id, nombre, precio, imagen, descripcion, cantidad FROM productos';
    db.query(sql, (err, results) => {
        if(err){
            console.error("Error al obtener los productos:", err);
            return res.status(500).json({error: 'Error al obtener los productos'});
        }
        res.json(results);
    });
}

// Agregar producto (admin)
export const agregarProducto = (req, res) => {
    const { nombre, precio, imagen, descripcion, cantidad } = req.body;
    if (!nombre || precio == null) return res.status(400).json({ message: 'Faltan campos requeridos' });

    const sql = 'INSERT INTO productos (nombre, precio, imagen, descripcion, cantidad) VALUES (?, ?, ?, ?, ?)';
    const params = [nombre, precio, imagen || '', descripcion || '', cantidad != null ? cantidad : 0];
    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error añadiendo producto:', err);
            return res.status(500).json({ message: 'Error al añadir producto' });
        }
        res.status(201).json({ id: result.insertId, message: 'Producto añadido' });
    });
};

// Eliminar producto por id (admin)
export const eliminarProducto = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM productos WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error eliminando producto:', err);
            return res.status(500).json({ message: 'Error al eliminar producto' });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto eliminado' });
    });
};

// Actualizar descripción y/o cantidad (admin)
export const actualizarProducto = (req, res) => {
    const { id } = req.params;
    const { descripcion, cantidad } = req.body;
    if (descripcion == null && cantidad == null) return res.status(400).json({ message: 'Nada que actualizar' });

    const fields = [];
    const params = [];
    if (descripcion != null) {
        fields.push('descripcion = ?');
        params.push(descripcion);
    }
    if (cantidad != null) {
        fields.push('cantidad = ?');
        params.push(cantidad);
    }
    params.push(id);

    const sql = `UPDATE productos SET ${fields.join(', ')} WHERE id = ?`;
    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error actualizando producto:', err);
            return res.status(500).json({ message: 'Error al actualizar producto' });
        }
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Producto no encontrado' });
        res.json({ message: 'Producto actualizado' });
    });
};

// Reducir stock tras una compra: recibe un array { id, cantidad }
export const reducirStock = (req, res) => {
    const items = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Items requeridos' });

    // Procesar uno por uno
    const errores = [];
    let processed = 0;

    items.forEach(it => {
        const sql = 'UPDATE productos SET cantidad = GREATEST(cantidad - ?, 0) WHERE id = ?';
        db.query(sql, [it.cantidad, it.id], (err, result) => {
            processed++;
            if (err) {
                console.error('Error reduciendo stock para id', it.id, err);
                errores.push({ id: it.id, error: err.message || err });
            } else if (result.affectedRows === 0) {
                errores.push({ id: it.id, error: 'Producto no encontrado' });
            }

            if (processed === items.length) {
                if (errores.length) return res.status(207).json({ message: 'Procesado con errores', errores });
                return res.json({ message: 'Stock actualizado' });
            }
        });
    });
};