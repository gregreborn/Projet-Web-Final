import pool from '../db.js';
import * as Tables from '../models/tablesModel.js';

// Créneaux horaires disponibles pour le service
const serviceTimeSlots = ["11:30", "17:30", "20:00"];

// Vérifie si l'heure de réservation est valide
export const validateServiceTime = (datetime) => {
    const time = datetime.split('T')[1].substring(0, 5);
    return serviceTimeSlots.includes(time);
};

// Récupère une table disponible pour un créneau horaire spécifique
export const getAvailableTable = async (numPeople, datetime) => {
    const timeSlot = datetime.split('T')[1].substring(0, 5);

    // Cherche une table disponible qui n'est pas réservée pour le même jour et créneau horaire
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

// Récupère toutes les réservations (pour admin)
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

// Récupère les réservations futures d'un client (à partir d'aujourd'hui)
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

// Récupère une réservation par son ID
export const getReservationById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM reservations WHERE id = $1',
        [id]
    );
    return result.rows[0] || null;
};

// Crée une nouvelle réservation
export const createReservation = async (client_id, num_people, datetime) => {
    if (!validateServiceTime(datetime)) {
        throw new Error('Créneau horaire invalide.');
    }

    const table = await getAvailableTable(num_people, datetime);
    if (!table) {
        throw new Error('Aucune table disponible pour ce créneau horaire.');
    }

    const result = await pool.query(
        `INSERT INTO reservations (client_id, table_id, num_people, datetime)
     VALUES ($1, $2, $3, $4) RETURNING *`,
        [client_id, table.id, num_people, datetime]
    );

    return result.rows[0];
};

// Réaffecte automatiquement les réservations existantes pour optimiser l'utilisation des tables
export const reassignReservationsForTimeSlot = async (datetime) => {
    const datetimeStr = (datetime instanceof Date) ? datetime.toISOString() : datetime;
    let changesMade = true;
    while (changesMade) {
        changesMade = false;
        const datePart = datetimeStr.split('T')[0];
        const timeSlot = datetimeStr.split('T')[1].substring(0, 5);

        const result = await pool.query(
            `SELECT * FROM reservations
       WHERE DATE(datetime) = $1 AND TO_CHAR(datetime, 'HH24:MI') = $2
       ORDER BY num_people ASC`,
            [datePart, timeSlot]
        );
        const reservations = result.rows;

        for (const reservation of reservations) {
            const currentTableSeatsResult = await pool.query(
                'SELECT seats FROM tables WHERE id = $1',
                [reservation.table_id]
            );
            const currentTableSeats = currentTableSeatsResult.rows[0]?.seats ?? 9999;

            const reservationDateStr = reservation.datetime instanceof Date
                ? reservation.datetime.toISOString()
                : reservation.datetime;

            const optimalTable = await getAvailableTable(reservation.num_people, reservationDateStr);
            if (!optimalTable) continue;

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

// Met à jour une réservation existante
export const updateReservation = async (reservationId, num_people, datetime) => {
    if (!validateServiceTime(datetime)) {
        throw new Error('Créneau horaire invalide.');
    }

    const table = await getAvailableTable(num_people, datetime);
    if (!table) {
        throw new Error('Aucune table disponible pour ce créneau horaire.');
    }

    const result = await pool.query(
        `UPDATE reservations
     SET table_id = $1, num_people = $2, datetime = $3
     WHERE id = $4 RETURNING *`,
        [table.id, num_people, datetime, reservationId]
    );

    await reassignReservationsForTimeSlot(datetime);

    return result.rows[0];
};

// Supprime une réservation
export const deleteReservation = async (reservationId) => {
    await pool.query('DELETE FROM reservations WHERE id = $1', [reservationId]);
};

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
