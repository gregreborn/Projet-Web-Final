import express from 'express';
import {
    registerClient,
    loginClient,
    getClientById,
    updateClient,
    getAllClients,
    deleteClient,
    createClient,
    getClientByEmail
} from '../models/clientsModel.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import pool from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

if (!pool) {
    console.error("Database pool is not defined. Check db.js.");
}

const router = express.Router();

router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Create or retrieve a client securely
router.post('/create-or-get-client', async (req, res) => {
    const { name, email } = req.body;

    try {
        const clientCheck = await pool.query(
            `SELECT * FROM clients WHERE email = $1`,
            [email]
        );

        if (clientCheck.rows.length > 0) {
            // Existing client: prompt for manual login
            return res.status(400).json({
                message:
                    "Un compte avec cet email pourrait déjà exister. Veuillez vous connecter pour continuer."
            });
        }

        // Generate a random password for new users
        const autoPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(autoPassword, 10);

        // Create new user
        const newClient = await pool.query(
            `INSERT INTO clients (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin`,
            [name, email, hashedPassword]
        );

        // Generate JWT token for automatic login
        const token = jwt.sign(
            { id: newClient.rows[0].id, email: newClient.rows[0].email, is_admin: newClient.rows[0].is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({
            user: newClient.rows[0],
            autoPassword, // So the user can change it later
            token, // Automatically log in
            message: "Compte créé avec succès. Connecté automatiquement."
        });
    } catch (error) {
        console.error('Error in create-or-get-client:', error);
        res.status(500).json({ error: error.message });
    }
});

// Enregistrement d'un nouveau client
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await registerClient(name, email, password);
        res.status(201).json(user);
    } catch (error) {
        if (error.code === '23505') {
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
        const user = await loginClient(email, password);
        if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, is_admin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Récupérer la fiche du client connecté (profil)
router.get('/profile', authenticate, async (req, res) => {
    try {
        const clientId = req.user.id;
        const result = await pool.query(
            `SELECT id, name, email, is_admin FROM clients WHERE id = $1`,
            [clientId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Client non trouvé." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error("❌ Error fetching profile:", error);
        res.status(500).json({ error: error.message });
    }
});

// Mise à jour de la fiche du client
router.put('/:id', authenticate, async (req, res) => {
    const userId = req.user.id;
    const requestedId = parseInt(req.params.id, 10);

    console.log(`🔹 Updating Profile - Authenticated User ID: ${userId}, Requested ID: ${requestedId}`);

    if (requestedId !== userId && !req.user.is_admin) {
        console.warn("🚫 Forbidden: User not authorized to modify this profile.");
        return res.status(403).json({ error: 'Accès refusé' });
    }

    try {
        const updatedClient = await updateClient(requestedId, req.body);
        res.json(updatedClient);
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ error: error.message });
    }
});

// Pour l'admin : récupérer la liste de tous les clients
router.get('/', authenticate, isAdmin, async (req, res) => {
    try {
        const clients = await getAllClients();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Pour l'admin : supprimer un client
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        await deleteClient(req.params.id);
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
        const isMatch = await bcrypt.compare(oldPassword, client.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Ancien mot de passe incorrect." });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({ error: "Le nouveau mot de passe doit être différent de l'ancien." });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
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

// ✅ Admin: Create a new client
router.post('/', authenticate, isAdmin, async (req, res) => {
    const { name, email, password, is_admin } = req.body;

    console.log('🛠️ Incoming is_admin:', is_admin);

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nom, email et mot de passe sont requis.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    try {
        const existingClient = await getClientByEmail(email);
        if (existingClient) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
        }

        const adminStatus = is_admin === true || is_admin === 'true';
        const newClient = await createClient(name, email, password, adminStatus);
        res.status(201).json(newClient);
    } catch (error) {
        console.error('Erreur lors de la création du client:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
