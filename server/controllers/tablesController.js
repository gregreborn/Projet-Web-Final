import * as Tables from '../models/tablesModel.js';
import pool from '../db.js';

// Récupère la liste de toutes les tables
export async function getTables(req, res) {
    try {
        const tables = await Tables.getAllTables();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Crée une nouvelle table (pas de limite de sièges pour l'administrateur)
export async function createTable(req, res) {
    const { seats } = req.body;
    if (!seats || seats < 1) {
        return res.status(400).json({ error: 'Le nombre de sièges doit être supérieur à zéro.' });
    }
    try {
        const table = await Tables.createTable(seats);
        console.log('✅ Table créée :', table);
        res.status(201).json(table);
    } catch (error) {
        console.error('❌ Erreur lors de la création de la table :', error);
        res.status(500).json({ error: error.message });
    }
}

// Met à jour une table existante (pas de limite de sièges pour l'administrateur)
export async function updateTable(req, res) {
    const { id } = req.params;
    const updatedData = req.body;

    if (updatedData.seats && updatedData.seats < 1) {
        return res.status(400).json({ error: 'Le nombre de sièges doit être supérieur à zéro.' });
    }

    try {
        const updatedTable = await Tables.updateTable(id, updatedData);
        res.json(updatedTable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Supprime une table existante
export async function deleteTable(req, res) {
    const { id } = req.params;
    try {
        await Tables.deleteTable(id);
        res.json({ message: 'Table supprimée avec succès.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function initializeTables(req, res) {
    try {
        await Tables.initializeTables();
        res.status(201).json({ message: 'Tables initialized successfully.' });
    } catch (error) {
        console.error('Error initializing tables:', error);
        res.status(500).json({ error: 'Failed to initialize tables.' });
    }
}
export default {
    getTables,
    createTable,
    updateTable,
    deleteTable,
    initializeTables
};
