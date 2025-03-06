const pool = require('../db');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Enregistrer un nouveau client
async function registerClient(name, email, password) {
    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const result = await pool.query(
        `INSERT INTO clients (name, email, password, is_admin)
     VALUES ($1, $2, $3, false) RETURNING *`,
        [name, email, hashedPassword]
    );
    return result.rows[0];
}

// Connexion d'un client
async function loginClient(email, password) {
    const result = await pool.query(
        `SELECT * FROM clients WHERE email = $1`,
        [email]
    );
    const client = result.rows[0];
    if (!client) {
        return null;
    }
    const match = await bcrypt.compare(password, client.password);
    if (!match) {
        return null;
    }
    return client;
}

// Récupérer un client par son ID
async function getClientById(id) {
    const result = await pool.query(
        `SELECT * FROM clients WHERE id = $1`,
        [id]
    );
    return result.rows[0];
}

// Mettre à jour un client
async function updateClient(id, updatedData) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updatedData.name) {
        fields.push(`name = $${idx}`);
        values.push(updatedData.name);
        idx++;
    }
    if (updatedData.email) {
        // 🔍 First, check if the email already exists (excluding the current user)
        const emailCheck = await pool.query(
            `SELECT id FROM clients WHERE email = $1 AND id != $2`,
            [updatedData.email, id]
        );

        if (emailCheck.rows.length > 0) {
            throw new Error("Cet email ne peut pas être utilisé. Veuillez en choisir un autre.");
        }

        fields.push(`email = $${idx}`);
        values.push(updatedData.email);
        idx++;
    }
    if (updatedData.password) {
        const hashedPassword = await bcrypt.hash(updatedData.password, 10);
        fields.push(`password = $${idx}`);
        values.push(hashedPassword);
        idx++;
    }

    if (fields.length === 0) {
        return await getClientById(id);
    }

    values.push(id);
    const query = `UPDATE clients SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, is_admin`;
    const result = await pool.query(query, values);
    return result.rows[0];
}


// Récupérer la liste de tous les clients (pour l'admin)
async function getAllClients() {
    const result = await pool.query(
        `SELECT * FROM clients ORDER BY id`
    );
    return result.rows;
}

// Supprimer un client (pour l'admin)
async function deleteClient(id) {
    const result = await pool.query(
        `DELETE FROM clients WHERE id = $1`,
        [id]
    );
    return result.rowCount;
}

module.exports = {
    registerClient,
    loginClient,
    getClientById,
    updateClient,
    getAllClients,
    deleteClient
};
