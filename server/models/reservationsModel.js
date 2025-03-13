import pool from '../db.js';
import * as Tables from '../models/tablesModel.js'; // if needed

// Available service time slots
const serviceTimeSlots = ["11:30", "17:30", "20:00"];

// ✅ Validate if the selected time is within allowed service slots
export const validateServiceTime = (datetime) => {
    const time = datetime.split('T')[1].substring(0, 5);
    return serviceTimeSlots.includes(time);
};

// ✅ Get available table for a specific time slot
export const getAvailableTable = async (numPeople, datetime) => {
    const timeSlot = datetime.split('T')[1].substring(0, 5);

    // Check for available table that is not booked for the same date and time slot
    const result = await pool.query(
        `SELECT t.* FROM tables t
         WHERE t.seats >= $1
           AND t.id NOT IN (
             SELECT table_id FROM reservations
             WHERE DATE(datetime) = $2 AND TO_CHAR(datetime, 'HH24:MI') = $3
         )
         ORDER BY t.seats ASC
         LIMIT 1`,
        [numPeople, datetime.split('T')[0], timeSlot]
    );

    return result.rows[0];
};

// ✅ Get all reservations (Admin)
export const getAllReservations = async () => {
    const result = await pool.query(`
        SELECT
            r.id,
            r.client_id,
            c.name AS client_name,
            c.email AS email,
            r.table_id,
            r.num_people,
            r.datetime
        FROM reservations r
                 JOIN clients c ON r.client_id = c.id
        ORDER BY r.datetime
    `);

    return result.rows.map(row => ({
        ...row,
        datetime: new Date(row.datetime).toISOString(),
    }));
};

// ✅ Get client's future reservations (from today onwards)
export const getClientReservations = async (client_id, today) => {
    const result = await pool.query(
        `SELECT
         r.id,
         r.client_id,
         c.name AS client_name,
         c.email AS email,
         r.table_id,
         r.num_people,
         r.datetime
     FROM reservations r
     JOIN clients c ON r.client_id = c.id
     WHERE r.client_id = $1 AND DATE(r.datetime) >= $2
     ORDER BY r.datetime`,
        [client_id, today]
    );

    return result.rows.map(row => ({
        ...row,
        datetime: new Date(row.datetime).toISOString(),
    }));
};

// ✅ Get reservation by ID
export const getReservationById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM reservations WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
};

// ✅ Create a reservation
export const createReservation = async (client_id, num_people, datetime) => {
    if (!validateServiceTime(datetime)) {
        throw new Error('Invalid reservation time slot.');
    }

    const table = await getAvailableTable(num_people, datetime);
    if (!table) {
        throw new Error('No available table for this time slot.');
    }

    const result = await pool.query(
        `INSERT INTO reservations (client_id, table_id, num_people, datetime)
     VALUES ($1, $2, $3, $4) RETURNING *`,
        [client_id, table.id, num_people, datetime]
    );

    return result.rows[0];
};

// Reassign reservations for a given time slot if a more optimal table becomes available (iterative version)
export const reassignReservationsForTimeSlot = async (datetime) => {
    // Ensure datetime is a string (ISO)
    const datetimeStr = (datetime instanceof Date) ? datetime.toISOString() : datetime;
    let changesMade = true;
    while (changesMade) {
        changesMade = false;
        const datePart = datetimeStr.split('T')[0];
        const timeSlot = datetimeStr.split('T')[1].substring(0, 5);

        // Get all reservations for this date and time slot
        const result = await pool.query(
            `SELECT * FROM reservations
       WHERE DATE(datetime) = $1 AND TO_CHAR(datetime, 'HH24:MI') = $2
       ORDER BY num_people ASC`,
            [datePart, timeSlot]
        );
        const reservations = result.rows;

        for (const reservation of reservations) {
            // Get the current table's seat count
            const currentTableSeatsResult = await pool.query(
                'SELECT seats FROM tables WHERE id = $1',
                [reservation.table_id]
            );
            const currentTableSeats = currentTableSeatsResult.rows[0]?.seats ?? 9999;

            // Convert reservation.datetime to string if needed
            const reservationDateStr = reservation.datetime instanceof Date
                ? reservation.datetime.toISOString()
                : reservation.datetime;

            // Attempt to find a smaller table
            const optimalTable = await getAvailableTable(reservation.num_people, reservationDateStr);
            if (!optimalTable) continue;

            // Reassign only if new table is strictly smaller than current one
            if (optimalTable.seats < currentTableSeats) {
                await pool.query(
                    'UPDATE reservations SET table_id = $1 WHERE id = $2',
                    [optimalTable.id, reservation.id]
                );
                console.log(`Reservation ${reservation.id} => Table ${optimalTable.id} (was ${reservation.table_id})`);
                changesMade = true;
            }
        }
    }
};

// ✅ Update a reservation
export const updateReservation = async (reservationId, num_people, datetime) => {
    if (!validateServiceTime(datetime)) {
        throw new Error('Invalid reservation time slot.');
    }

    const table = await getAvailableTable(num_people, datetime);
    if (!table) {
        throw new Error('No available table for this time slot.');
    }

    // Update the reservation with the new table assignment
    const result = await pool.query(
        `UPDATE reservations
     SET table_id = $1, num_people = $2, datetime = $3
     WHERE id = $4 RETURNING *`,
        [table.id, num_people, datetime, reservationId]
    );

    // Run iterative reassignments for the same time slot
    await reassignReservationsForTimeSlot(datetime);

    return result.rows[0];
};

// ✅ Delete a reservation
export const deleteReservation = async (reservationId) => {
    await pool.query('DELETE FROM reservations WHERE id = $1', [reservationId]);
};

// ✅ Check reservation conflict manually (optional if logic changes later)
export const checkReservationConflict = async (table_id, datetime, reservationId = null) => {
    const query = `
    SELECT * FROM reservations
    WHERE table_id = $1 AND datetime = $2
    ${reservationId ? "AND id != $3" : ""}
  `;
    const values = reservationId ? [table_id, datetime, reservationId] : [table_id, datetime];
    const result = await pool.query(query, values);
    return result.rows.length > 0;
};
