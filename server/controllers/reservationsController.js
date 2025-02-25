const Reservations = require('../models/reservationsModel');

// Get all reservations
exports.getReservations = async (req, res) => {
    try {
        const reservations = await Reservations.getAllReservations();
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a reservation
exports.createReservation = async (req, res) => {
    const { client_id, table_id, datetime } = req.body;

    try {
        const reservation = await Reservations.createReservation(client_id, table_id, datetime);
        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
