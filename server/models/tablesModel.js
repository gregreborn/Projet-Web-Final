const pool = require('../db.js');  // ✅ Correct

const getAllTables = async () => {
    try {
        const result = await pool.query('SELECT * FROM tables ORDER BY id');
        return result.rows;
    } catch (error) {
        console.error("Error fetching tables:", error);
        throw error;
    }
};

const initializeTables = async () => {
    const tableConfig = [
        { seats: 2, count: 2 },
        { seats: 4, count: 4 },
        { seats: 6, count: 4 },
    ];

    for (const config of tableConfig) {
        for (let i = 0; i < config.count; i++) {
            await pool.query('INSERT INTO tables (seats) VALUES ($1)', [config.seats]);
        }
    }
};

const getAvailableTable = async (numPeople, datetime) => {
    const result = await pool.query(
        `SELECT t.* FROM tables t
         WHERE t.seats >= $1 AND t.id NOT IN (
             SELECT table_id FROM reservations WHERE datetime = $2
         ) ORDER BY t.seats ASC LIMIT 1`,
        [numPeople, datetime]
    );
    return result.rows[0];
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

module.exports = { getAllTables, initializeTables,getAvailableTable, createTable, updateTable, deleteTable };
