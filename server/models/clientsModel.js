const pool = require('../db.js');  // ✅ Correct
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerClient = async (name, email, password, isAdmin = false) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
        'INSERT INTO clients (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, name, email, is_admin',
        [name, email, hashedPassword, isAdmin]
    );
    return result.rows[0];
};


const loginClient = async (email, password) => {
    const result = await pool.query('SELECT * FROM clients WHERE email = $1', [email]);
    if (result.rows.length === 0) return null;

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    const token = jwt.sign(
        { id: user.id, email: user.email, isAdmin: user.is_admin },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return { token, user };
};


module.exports = { registerClient, loginClient };
