import db from '../config/db.js';

// Helper that tries tableName1 then falls back to tableName2 if table doesn't exist
async function queryWithTableFallback(queryTemplate, params) {
    return new Promise((resolve, reject) => {
        db.query(queryTemplate, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

async function tryQueryWithFallback(baseQuery, params) {
    // baseQuery should include a placeholder for the table name: e.g. 'SELECT * FROM {table} WHERE correo = ?'
    const t1 = baseQuery.replace('{table}', 'usuarios');
    try {
        const res = await queryWithTableFallback(t1, params);
        return res;
    } catch (err) {
        // If table doesn't exist, try fallback to 'users'
        if (err && (err.code === 'ER_NO_SUCH_TABLE' || /no such table/i.test(err.message || ''))) {
            const t2 = baseQuery.replace('{table}', 'users');
            const res2 = await queryWithTableFallback(t2, params);
            return res2;
        }
        throw err;
    }
}

export const User = {
    create: (userData) => {
        return new Promise((resolve, reject) => {
            const insertTemplate = 'INSERT INTO {table} (nombre, correo, password) VALUES (?, ?, ?)';
            const params = [userData.nombre, userData.correo, userData.password];
            try {
                // try usuarios then users
                try {
                    const q = insertTemplate.replace('{table}', 'usuarios');
                    db.query(q, params, (error, results) => {
                        if (error) {
                            // if table missing, try users
                            if (error.code === 'ER_NO_SUCH_TABLE' || /no such table/i.test(error.message || '')) {
                                const q2 = insertTemplate.replace('{table}', 'users');
                                db.query(q2, params, (err2, results2) => {
                                    if (err2) return reject(err2);
                                    return resolve(results2);
                                });
                            } else {
                                return reject(error);
                            }
                        } else {
                            return resolve(results);
                        }
                    });
                } catch (e) {
                    return reject(e);
                }
            } catch (e) {
                reject(e);
            }
        });
    },

    findByEmail: async (email) => {
        // Try usuarios then users
        const base = 'SELECT * FROM {table} WHERE correo = ?';
        try {
            const res = await tryQueryWithFallback(base, [email]);
            return res[0];
        } catch (err) {
            throw err;
        }
    },


    validatePassword: (password, storedPassword) => {
        // Comparación directa, sin encriptación
        return Promise.resolve(password === storedPassword);
    },

    setResetToken: async (email, token, expires) => {
        // Intenta actualizar en usuarios, si no existe, en users
        const base = 'UPDATE {table} SET reset_token = ?, reset_token_expires = ? WHERE correo = ?';
        try {
            await tryQueryWithFallback(base, [token, expires, email]);
            return true;
        } catch (err) {
            throw err;
        }
    },

    findByResetToken: async (token) => {
        const base = 'SELECT * FROM {table} WHERE reset_token = ?';
        try {
            const res = await tryQueryWithFallback(base, [token]);
            return res[0];
        } catch (err) {
            throw err;
        }
    },

    updatePasswordByToken: async (token, newPassword) => {
        const base = 'UPDATE {table} SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?';
        try {
            await tryQueryWithFallback(base, [newPassword, token]);
            return true;
        } catch (err) {
            throw err;
        }
    }
};
