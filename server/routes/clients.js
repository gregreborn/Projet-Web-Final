const express = require('express');
const router = express.Router();
const Clients = require('../models/clientsModel');

// Register a new client
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await Clients.registerClient(name, email, password);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login a client
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Clients.loginClient(email, password);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
