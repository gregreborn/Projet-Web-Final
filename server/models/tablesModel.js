import pool from '../db.js';

// Récupère toutes les tables triées par ID
export async function getAllTables() {
    const result = await pool.query(`SELECT * FROM tables ORDER BY id`);
    return result.rows;
}

// Crée une nouvelle table avec un nombre de sièges spécifié
export async function createTable(seats) {
    const result = await pool.query(
        `INSERT INTO tables (seats) VALUES ($1) RETURNING *`,
        [seats]
    );
    return result.rows[0];
}

// Met à jour une table existante avec les données fournies
export async function updateTable(id, updatedData) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updatedData.seats !== undefined) {
        fields.push(`seats = $${idx}`);
        values.push(updatedData.seats);
        idx++;
    }

    if (updatedData.is_available !== undefined) {
        fields.push(`is_available = $${idx}`);
        values.push(updatedData.is_available);
        idx++;
    }

    if (fields.length === 0) {
        return await getTableById(id);
    }

    values.push(id);
    const query = `UPDATE tables SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);

    return result.rows[0];
}

// Supprime une table par son identifiant
export async function deleteTable(id) {
    const result = await pool.query(`DELETE FROM tables WHERE id = $1`, [id]);
    return result.rowCount;
}

// Récupère une table spécifique par ID
export async function getTableById(id) {
    const result = await pool.query(`SELECT * FROM tables WHERE id = $1`, [id]);
    return result.rows[0];
}

// Initialise les tables avec un ensemble prédéfini de sièges
export async function initializeTables() {
    const tables = [4, 4, 4, 4, 4, 4, 2, 2, 2, 2];
    const promises = tables.map(seats => createTable(seats));
    await Promise.all(promises);
}
