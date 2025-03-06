const express = require('express');
const router = express.Router();
const Clients = require('../models/clientsModel');
const { authenticate, isAdmin } = require('../middleware/auth'); // ✅ Import authenticate middleware properly
const pool = require('../db'); // ✅ Ensure db.js is imported
const jwt = require('jsonwebtoken');  // ✅ Import here to use JWT
const bcrypt = require('bcrypt'); // ✅ If not already imported, add bcrypt

// Fix: Add check to make sure pool is defined
if (!pool) {
    console.error("Database pool is not defined. Check db.js.");
}
// Create or retrieve a client based on email
router.post('/create-or-get-client', async (req, res) => {
    const { name, email } = req.body;

    try {
        const clientCheck = await pool.query(
            `SELECT * FROM clients WHERE email = $1`,
            [email]
        );

        if (clientCheck.rows.length > 0) {
            // ✅ Client already exists, return their info
            return res.json({ user: clientCheck.rows[0] });
        }

        // ✅ Generate a random password for new users
        const autoPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(autoPassword, 10);

        // ✅ Create a new user
        const newClient = await pool.query(
            `INSERT INTO clients (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email`,
            [name, email, hashedPassword]
        );

        res.json({
            user: newClient.rows[0],
            autoPassword
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Enregistrement d'un nouveau client
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await Clients.registerClient(name, email, password);
        res.status(201).json(user);
    } catch (error) {
        if (error.code === '23505') { // violation de contrainte unique PostgreSQL
            return res.status(400).json({ error: 'Email déjà utilisé. Veuillez en choisir un autre.' });
        }
        console.error('Erreur d\'enregistrement:', error);
        res.status(500).json({ error: 'Erreur interne du serveur. Veuillez réessayer plus tard.' });
    }
});

// Connexion d'un client
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Clients.loginClient(email, password);
        if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

        // ✅ Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, isAdmin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Récupérer la fiche du client connecté (profil)
// On suppose que le middleware authenticate ajoute un objet "user" à req (contenant l'id, etc.)
// ✅ Protected route to get user profile
router.get('/profile', authenticate, async (req, res) => {
    try {
        const clientId = req.user.id;
        const result = await pool.query(`SELECT id, name, email, is_admin FROM clients WHERE id = $1`, [clientId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Client non trouvé." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error fetching profile:", error);
        res.status(500).json({ error: error.message });
    }
});

// Mise à jour de la fiche du client (le client peut modifier ses propres informations)
// Pour sécuriser, on vérifie que l'id dans l'URL correspond bien à celui du client connecté, ou que l'utilisateur est admin.
router.put('/:id', authenticate, async (req, res) => {
    const userId = req.user.id; // Extract user ID from token
    const requestedId = parseInt(req.params.id, 10); // Ensure ID is an integer

    console.log(`🔹 Updating Profile - Authenticated User ID: ${userId}, Requested ID: ${requestedId}`);

    if (requestedId !== userId && !req.user.isAdmin) {
        console.warn("🚫 Forbidden: User not authorized to modify this profile.");
        return res.status(403).json({ error: 'Accès refusé' });
    }

    try {
        const updatedClient = await Clients.updateClient(requestedId, req.body);
        res.json(updatedClient);
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ error: error.message });
    }
});


// Pour l'admin : récupérer la liste de tous les clients
router.get('/', authenticate, isAdmin, async (req, res) => {
    try {
        const clients = await Clients.getAllClients();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Pour l'admin : supprimer un client
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        await Clients.deleteClient(req.params.id);
        res.json({ message: 'Client supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/change-password', authenticate, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const clientId = req.user.id;

    try {
        const clientCheck = await pool.query(
            `SELECT * FROM clients WHERE id = $1`,
            [clientId]
        );

        if (clientCheck.rows.length === 0) {
            return res.status(404).json({ error: "Client non trouvé." });
        }

        const client = clientCheck.rows[0];

        // Check old password
        const isMatch = await bcrypt.compare(oldPassword, client.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Ancien mot de passe incorrect." });
        }

        // ✅ Check if new password is different from old password
        if (oldPassword === newPassword) {
            return res.status(400).json({ error: "Le nouveau mot de passe doit être différent de l'ancien." });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await pool.query(
            `UPDATE clients SET password = $1 WHERE id = $2`,
            [hashedNewPassword, clientId]
        );

        res.json({ message: "Mot de passe modifié avec succès !" });

    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
