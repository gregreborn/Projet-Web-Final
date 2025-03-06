const validateServiceTime = (datetime) => {
    // Définition des plages horaires pour les services
    const serviceHours = [
        { start: "11:30", end: "13:30" },
        { start: "17:30", end: "20:00" },
        { start: "20:00", end: "22:30" }
    ];

    // Extraire uniquement l'heure au format HH:MM
    const reservationTime = datetime.split('T')[1].substring(0, 5); // HH:MM

    // Vérifier si l'heure fournie appartient à l'une des plages horaires
    return serviceHours.some(service =>
        reservationTime >= service.start && reservationTime < service.end
    );
};

// Exporter en CommonJS
module.exports.validateServiceTime = validateServiceTime;


const pool = require('../db'); // Ensure the database connection is imported

// Get all reservations (Admin)
const getAllReservations = async () => {
    try {
        const result = await pool.query('SELECT * FROM reservations ORDER BY datetime');

        // Convert all datetimes to ISO format
        return result.rows.map(row => ({
            ...row,
            datetime: new Date(row.datetime).toISOString()
        }));
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

// Get a reservation by ID
const getReservationById = async (reservationId) => {
    try {
        const result = await pool.query(
            'SELECT * FROM reservations WHERE id = $1',
            [reservationId]
        );
        return result.rows[0] || null;
    } catch (error) {
        throw new Error(`Error fetching reservation by ID: ${error.message}`);
    }
};
// Create a new reservation
const createReservation = async (client_id, table_id, datetime) => {
    try {
        // Vérifier que la date de réservation est dans le futur
        if (new Date(datetime) <= new Date()) {
            throw new Error('La date de réservation doit être dans le futur.');
        }

        // Vérifier si l'heure fournie correspond à un service valide
        if (!validateServiceTime(datetime)) {
            throw new Error('L\'heure de réservation ne correspond à aucun service disponible.');
        }

        // Vérifier s'il existe déjà une réservation sur ce créneau pour cette table
        const conflict = await checkReservationConflict(table_id, datetime);
        if (conflict) {
            throw new Error('Cette table est déjà réservée pour ce service à cette date/heure.');
        }

        // Si aucun conflit, créer la réservation
        const result = await pool.query(
            'INSERT INTO reservations (client_id, table_id, datetime) VALUES ($1, $2, $3) RETURNING *',
            [client_id, table_id, datetime]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors de la création de la réservation: ${error.message}`);
    }
};



// Update a reservation
const updateReservation = async (reservationId, data) => {
    try {
        const { table_id, datetime } = data;

        // Vérifier que la date de réservation est dans le futur
        if (new Date(datetime) <= new Date()) {
            throw new Error('La date de réservation doit être dans le futur.');
        }

        // Vérifier si l'heure fournie correspond à un service valide
        if (!validateServiceTime(datetime)) {
            throw new Error('L\'heure de réservation ne correspond à aucun service disponible.');
        }

        // Vérifier s'il existe un conflit avec une autre réservation
        const conflict = await checkReservationConflict(table_id, datetime, reservationId);
        if (conflict) {
            throw new Error('Cette table est déjà réservée pour ce service à cette date/heure.');
        }

        // Mise à jour de la réservation
        const result = await pool.query(
            'UPDATE reservations SET table_id = $1, datetime = $2 WHERE id = $3 RETURNING *',
            [table_id, datetime, reservationId]
        );

        return result.rows[0];
    } catch (error) {
        throw new Error(`Erreur lors de la mise à jour de la réservation: ${error.message}`);
    }
};


// Delete a reservation
const deleteReservation = async (reservationId) => {
    try {
        await pool.query('DELETE FROM reservations WHERE id = $1', [reservationId]);
        return { message: 'Reservation deleted successfully' };
    } catch (error) {
        throw new Error(`Error deleting reservation: ${error.message}`);
    }
};

// Fonction pour vérifier s'il y a un conflit de réservation sur une même table
const checkReservationConflict = async (table_id, datetime, reservationId = null) => {
    try {
        // Définition des plages horaires pour les services
        const serviceHours = [
            { start: "11:30", end: "13:30" },
            { start: "17:30", end: "20:00" },
            { start: "20:00", end: "22:30" }
        ];

        // Extraire uniquement la date et l'heure du datetime fourni
        const reservationDate = new Date(datetime).toISOString().split('T')[0]; // Format YYYY-MM-DD
        const reservationTime = datetime.split('T')[1].substring(0, 5); // HH:MM

        // Trouver la plage horaire correspondante
        const matchedService = serviceHours.find(service =>
            reservationTime >= service.start && reservationTime < service.end
        );

        if (!matchedService) {
            throw new Error('L\'heure de réservation ne correspond à aucun service disponible.');
        }

        // Vérifier si une réservation existe déjà dans cette plage horaire pour la même table
        const query = `
            SELECT * FROM reservations
            WHERE table_id = $1 
            AND DATE(datetime) = $2 
            AND TO_CHAR(datetime, 'HH24:MI') BETWEEN $3 AND $4
            ${reservationId ? "AND id != $5" : ""}
        `;

        const values = reservationId
            ? [table_id, reservationDate, matchedService.start, matchedService.end, reservationId]
            : [table_id, reservationDate, matchedService.start, matchedService.end];

        const result = await pool.query(query, values);

        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        throw new Error(`Erreur lors de la vérification du conflit de réservation: ${error.message}`);
    }
};


// Export des fonctions mises à jour
module.exports = {
    getAllReservations,
    getClientReservations,
    createReservation,
    getReservationById,
    updateReservation,
    deleteReservation,
    checkReservationConflict,
    validateServiceTime
};