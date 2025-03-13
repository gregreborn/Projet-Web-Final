import pool from '../db.js';

// ✅ Get All Tables
export async function getAllTables() {
    const result = await pool.query(`SELECT * FROM tables ORDER BY id`);
    return result.rows;
}

// ✅ Create a Table
export async function createTable(seats) {
    const result = await pool.query(
        `INSERT INTO tables (seats) VALUES ($1) RETURNING *`,
        [seats]
    );
    return result.rows[0];
}

// ✅ Update a Table
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

// ✅ Delete a Table
export async function deleteTable(id) {
    const result = await pool.query(`DELETE FROM tables WHERE id = $1`, [id]);
    return result.rowCount;
}

// ✅ Get Table by ID
export async function getTableById(id) {
    const result = await pool.query(`SELECT * FROM tables WHERE id = $1`, [id]);
    return result.rows[0];
}
