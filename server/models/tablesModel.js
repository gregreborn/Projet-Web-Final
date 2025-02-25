const pool = require('../db'); // Import DB connection

const getAllTables = async () => {
    try {
        const result = await pool.query('SELECT * FROM tables ORDER BY id');
        return result.rows;
    } catch (error) {
        console.error("Error fetching tables:", error);
        throw error;
    }
};

const createTable = async (seats) => {
    try {
        const result = await pool.query(
            'INSERT INTO tables (seats) VALUES ($1) RETURNING *',
            [seats]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error creating table:", error);
        throw error;
    }
};

const updateTable = async (id, seats) => {
    try {
        const result = await pool.query(
            'UPDATE tables SET seats = $1 WHERE id = $2 RETURNING *',
            [seats, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error updating table:", error);
        throw error;
    }
};

const deleteTable = async (id) => {
    try {
        await pool.query('DELETE FROM tables WHERE id = $1', [id]);
    } catch (error) {
        console.error("Error deleting table:", error);
        throw error;
    }
};

module.exports = { getAllTables, createTable, updateTable, deleteTable };
