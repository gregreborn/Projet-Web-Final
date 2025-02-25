const Reservations = require('../models/reservationsModel');

exports.getReservations = async (req, res) => {
    try {
        console.log("User Info from Token:", req.user); // ✅ Debugging

        if (req.user.isAdmin) {
            console.log("Admin fetching all reservations...");
            const reservations = await Reservations.getAllReservations();
            return res.json(reservations);
        } else {
            console.log(`Client ${req.user.id} fetching their reservations...`);
            const reservations = await Reservations.getClientReservations(req.user.id);
            return res.json(reservations);
        }
    } catch (error) {
        console.error("Error in getReservations:", error);
        res.status(500).json({ error: error.message });
    }
};


exports.createReservation = async (req, res) => {
    const { table_id, datetime } = req.body;

    try {
        const reservation = await Reservations.createReservation(req.user.id, table_id, datetime);
        res.status(201).json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
