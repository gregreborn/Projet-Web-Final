const pool = require('../db'); // Ensure the database connection is imported

// Get all reservations (Admin)
const getAllReservations = async () => {
    try {
        const result = await pool.query('SELECT * FROM reservations ORDER BY datetime');
        return result.rows;
    } catch (error) {
        throw new Error(`Error fetching all reservations: ${error.message}`);
    }
};

// Get reservations for a specific client (Only Future Reservations)
const getClientReservations = async (client_id) => {
    try {
        const result = await pool.query(
            'SELECT * FROM reservations WHERE client_id = $1 AND datetime > NOW() ORDER BY datetime',
            [client_id]
        );
        return result.rows;
    } catch (error) {
        throw new Error(`Error fetching client reservations: ${error.message}`);
    }
};

// Create a new reservation
const createReservation = async (client_id, table_id, datetime) => {
    try {
        // Ensure the reservation is in the future
        if (new Date(datetime) <= new Date()) {
            throw new Error('Reservation date must be in the future');
        }

        // Check if a reservation already exists for the same table at the same time
        const existingReservation = await pool.query(
            'SELECT * FROM reservations WHERE table_id = $1 AND datetime = $2',
            [table_id, datetime]
        );

        if (existingReservation.rows.length > 0) {
            throw new Error('This table is already reserved for the selected time.');
        }

        // If no conflicts, create the reservation
        const result = await pool.query(
            'INSERT INTO reservations (client_id, table_id, datetime) VALUES ($1, $2, $3) RETURNING *',
            [client_id, table_id, datetime]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error(`Error creating reservation: ${error.message}`);
    }
};


// Export the functions
module.exports = { getAllReservations, getClientReservations, createReservation };
