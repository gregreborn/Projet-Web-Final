import * as Reservations from '../models/reservationsModel.js';
import { validateServiceTime } from '../models/reservationsModel.js';

export async function getReservations(req, res) {
    try {
        if (req.user.is_admin) {
            // Admin: Fetch all reservations
            const allReservations = await Reservations.getAllReservations();
            return res.json(allReservations);
        } else {
            // Clients: Only their future reservations (from today onward)
            const today = new Date().toISOString().split('T')[0];
            const userReservations = await Reservations.getClientReservations(req.user.id, today);
            return res.json(userReservations);
        }
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function createReservation(req, res) {
    const { client_id, num_people, datetime } = req.body;

    if (!num_people || !datetime || (!client_id && req.user.is_admin)) {
        return res.status(400).json({ error: "Missing reservation data." });
    }

    // Validate reservation time
    if (!validateServiceTime(datetime)) {
        return res.status(400).json({ error: "Invalid service time for reservation." });
    }

    try {
        // Determine the correct client ID
        const userId = req.user.is_admin ? client_id : req.user.id;

        // Prevent multiple reservations by the same client on the same day
        const userReservations = await Reservations.getClientReservations(userId);
        const dateOnly = datetime.split('T')[0];
        const existingReservation = userReservations.find(res =>
            new Date(res.datetime).toISOString().startsWith(dateOnly)
        );
        if (existingReservation) {
            return res.status(400).json({ error: "You already have a reservation for this day." });
        }

        // Create the reservation
        const reservation = await Reservations.createReservation(userId, num_people, datetime);
        res.status(201).json(reservation);
    } catch (error) {
        console.error("Error creating reservation:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function updateReservation(req, res) {
    const reservationId = req.params.id;
    const { num_people, datetime } = req.body;

    if (!num_people || !datetime) {
        return res.status(400).json({ error: "Missing updated reservation data." });
    }

    try {
        // Verify the reservation exists
        const existingReservation = await Reservations.getReservationById(reservationId);
        if (!existingReservation) {
            return res.status(404).json({ error: "Reservation not found." });
        }

        // Authorization check: Admins can edit any, clients only their own
        if (!req.user.is_admin && existingReservation.client_id !== req.user.id) {
            return res.status(403).json({ error: "Access denied." });
        }

        // Validate reservation time
        if (!validateServiceTime(datetime)) {
            return res.status(400).json({ error: "Invalid service time." });
        }

        // Update the reservation with automatic table reassignment
        const updatedReservation = await Reservations.updateReservation(reservationId, num_people, datetime);
        res.json(updatedReservation);
    } catch (error) {
        console.error("Error updating reservation:", error);
        res.status(500).json({ error: error.message });
    }
}

export async function deleteReservation(req, res) {
    const reservationId = req.params.id;

    try {
        const existingReservation = await Reservations.getReservationById(reservationId);
        if (!existingReservation) {
            return res.status(404).json({ error: "Reservation not found." });
        }

        // Authorization check: Admins can delete any, clients only their own
        if (!req.user.is_admin && existingReservation.client_id !== req.user.id) {
            return res.status(403).json({ error: "Access denied." });
        }

        await Reservations.deleteReservation(reservationId);
        res.json({ message: "Reservation deleted successfully." });
    } catch (error) {
        console.error("Error deleting reservation:", error);
        res.status(500).json({ error: error.message });
    }
}

// Export default object for easy default import
export default {
    getReservations,
    createReservation,
    updateReservation,
    deleteReservation
};
