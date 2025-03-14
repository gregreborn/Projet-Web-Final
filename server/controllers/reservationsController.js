import * as Reservations from '../models/reservationsModel.js';
import { validateServiceTime } from '../models/reservationsModel.js';

// Récupérer les réservations selon le rôle de l'utilisateur
export async function getReservations(req, res) {
    try {
        if (req.user.is_admin) {
            // Admin : Récupère toutes les réservations
            const allReservations = await Reservations.getAllReservations();
            return res.json(allReservations);
        } else {
            // Client : Récupère seulement les réservations futures du client connecté
            const today = new Date().toISOString().split('T')[0];
            const userReservations = await Reservations.getClientReservations(req.user.id, today);
            return res.json(userReservations);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des réservations :", error);
        res.status(500).json({ error: error.message });
    }
}

// Créer une nouvelle réservation
export async function createReservation(req, res) {
    const { client_id, num_people, datetime } = req.body;

    if (!num_people || !datetime || (req.user.is_admin && !client_id)) {
        return res.status(400).json({ error: "Champs obligatoires manquants." });
    }

    if (!validateServiceTime(datetime)) {
        return res.status(400).json({ error: "Heure de réservation invalide." });
    }

    const clientId = req.user.is_admin ? client_id : req.user.id;
    const reservationDate = datetime.split('T')[0];

    try {
        // Vérifie les réservations existantes pour cette date
        const existingReservations = await Reservations.getClientReservations(client_id, reservationDate);

        if (existingReservations.some(res => res.datetime.startsWith(reservationDate))) {
            return res.status(400).json({ error:  "Une réservation existe déjà à cette date." });
        }

        const reservation = await Reservations.createReservation(client_id, num_people, datetime);
        res.status(201).json(reservation);
    } catch (error) {
        console.error("Erreur lors de la création de la réservation :", error);
        res.status(500).json({ error: error.message });
    }
}

// Mettre à jour une réservation existante
export async function updateReservation(req, res) {
    const reservationId = req.params.id;
    const { num_people, datetime } = req.body;

    if (!num_people || !datetime) {
        return res.status(400).json({ error: "Données de réservation mises à jour manquantes." });
    }

    try {
        const existingReservation = await Reservations.getReservationById(reservationId);
        if (!existingReservation) {
            return res.status(404).json({ error: "Réservation introuvable." });
        }

        // Vérification d'autorisation : admin ou propriétaire de la réservation
        if (!req.user.is_admin && existingReservation.client_id !== req.user.id) {
            return res.status(403).json({ error: "Accès refusé." });
        }

        if (!validateServiceTime(datetime)) {
            return res.status(400).json({ error: "Invalid service time." });
        }

        const updatedReservation = await Reservations.updateReservation(reservationId, num_people, datetime);
        res.json(updatedReservation);
    } catch (error) {
        console.error("Error updating reservation:", error);
        res.status(500).json({ error: error.message });
    }
}

// Supprimer une réservation existante
export async function deleteReservation(req, res) {
    const reservationId = req.params.id;

    try {
        const existingReservation = await Reservations.getReservationById(reservationId);
        if (!existingReservation) {
            return res.status(404).json({ error: "Réservation introuvable." });
        }

        // Vérification d'autorisation : admin ou propriétaire de la réservation
        if (!req.user.is_admin && existingReservation.client_id !== req.user.id) {
            return res.status(403).json({ error: "Accès refusé." });
        }

        await Reservations.deleteReservation(reservationId);
        res.json({ message: "Réservation supprimée avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression de la réservation :", error);
        res.status(500).json({ error: error.message });
    }
}

export default {
    getReservations,
    createReservation,
    updateReservation,
    deleteReservation
};
