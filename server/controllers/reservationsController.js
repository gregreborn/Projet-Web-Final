const Reservations = require('../models/reservationsModel');
const { validateServiceTime } = require('../models/reservationsModel');

exports.getReservations = async (req, res) => {
    try {
        console.log("User Info from Token:", req.user);

        // ✅ Fetch all reservations from the database
        const allReservations = await Reservations.getAllReservations();
        console.log("🔹 All reservations from DB:", allReservations);

        // ✅ If no user (public request), return only future reservations
        if (!req.user) {
            console.log("🔹 Public request: Showing only available reservations (no client info)");
            const now = new Date().toISOString();

            const filteredReservations = allReservations
                .filter(r => new Date(r.datetime).toISOString() >= now) // Only future reservations
                .map(r => ({
                    datetime: r.datetime,
                    table_id: r.table_id // Show table but NOT client details
                }));

            console.log("📤 Public reservations sent to frontend:", filteredReservations);
            return res.json(filteredReservations);
        }

        // ✅ Admins see everything
        if (req.user.isAdmin) {
            console.log("✅ Admin fetching all reservations...");
            return res.json(allReservations);
        }

        // ✅ Clients see only their own reservations
        console.log(`Client ${req.user.id} fetching their reservations...`);
        const userReservations = await Reservations.getClientReservations(req.user.id);
        return res.json(userReservations);
    } catch (error) {
        console.error("Error in getReservations:", error);
        res.status(500).json({ error: error.message });
    }
};







exports.createReservation = async (req, res) => {
    console.log("📥 Requête reçue pour création de réservation:", req.body);

    const { table_id, datetime, num_people } = req.body;

    try {
        if (!table_id || !datetime || !num_people) {
            console.error("❌ Données manquantes:", { table_id, datetime, num_people });
            return res.status(400).json({ error: "Toutes les données de réservation sont requises." });
        }

        if (!Reservations.validateServiceTime(datetime)) {
            console.error("❌ Heure de réservation invalide:", datetime);
            return res.status(400).json({ error: "L'heure de réservation ne correspond à aucun service disponible." });
        }

        // ✅ Prevent multiple reservations per user on the same day
        const userReservations = await Reservations.getClientReservations(req.user.id);
        const dateOnly = datetime.split('T')[0]; // Extract YYYY-MM-DD

        const existingReservation = userReservations.find(res =>
            new Date(res.datetime).toISOString().startsWith(dateOnly)
        );
        if (existingReservation) {
            console.error("❌ Conflit de réservation: L'utilisateur a déjà réservé ce jour-là.");
            return res.status(400).json({ error: "Vous avez déjà une réservation pour ce jour-là." });
        }

        // ✅ Prevent duplicate reservations for the same table/time
        const conflict = await Reservations.checkReservationConflict(table_id, datetime);
        if (conflict) {
            console.error("❌ Conflit détecté: La table est déjà réservée.", conflict);
            return res.status(400).json({ error: "Cette table est déjà réservée pour ce service à cette date/heure." });
        }

        console.log("✅ Données valides, création de la réservation...");
        const reservation = await Reservations.createReservation(req.user.id, table_id, datetime, num_people);
        return res.status(201).json(reservation);
    } catch (error) {
        console.error("❌ Erreur lors de la réservation:", error);
        return res.status(500).json({ error: error.message });
    }
};






// Mettre à jour une réservation
exports.updateReservation = async (req, res) => {
    const reservationId = req.params.id;
    const { table_id, datetime } = req.body;

    try {
        // Vérifier que la réservation existe
        const existingReservation = await Reservations.getReservationById(reservationId);
        if (!existingReservation) {
            return res.status(404).json({ error: 'Réservation non trouvée' });
        }

        // Si ce n'est pas un admin, vérifier que la réservation appartient bien au client connecté
        if (!req.user.isAdmin && existingReservation.client_id !== req.user.id) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        // Vérifier si l'heure fournie correspond à un service valide
        if (!Reservations.validateServiceTime(datetime)) {
            return res.status(400).json({ error: 'L\'heure de réservation ne correspond à aucun service disponible.' });
        }

        // Vérifier les conflits d’horaire pour la table demandée
        const conflict = await Reservations.checkReservationConflict(table_id, datetime, reservationId);
        if (conflict) {
            return res.status(400).json({ error: 'La table est déjà réservée pour ce service à cette date/heure.' });
        }

        // Effectuer la mise à jour de la réservation
        const updatedReservation = await Reservations.updateReservation(reservationId, { table_id, datetime });
        res.json(updatedReservation);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la réservation :", error);
        res.status(500).json({ error: error.message });
    }
};



// Supprimer une réservation
exports.deleteReservation = async (req, res) => {
    const reservationId = req.params.id;

    try {
        // Vérifier que la réservation existe
        const existingReservation = await Reservations.getReservationById(reservationId);
        if (!existingReservation) {
            return res.status(404).json({ error: 'Réservation non trouvée' });
        }

        // Si ce n'est pas un admin, vérifier que la réservation appartient bien au client connecté
        if (!req.user.isAdmin && existingReservation.client_id !== req.user.id) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        // Supprimer la réservation
        await Reservations.deleteReservation(reservationId);
        res.json({ message: 'Réservation supprimée avec succès' });
    } catch (error) {
        console.error("Erreur lors de la suppression de la réservation :", error);
        res.status(500).json({ error: error.message });
    }
};

