import * as Tables from '../models/tablesModel.js';
import pool from '../db.js';

// Get all tables
export async function getTables(req, res) {
    try {
        const tables = await Tables.getAllTables();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// Create a table (No seat limit for Admin)
export async function createTable(req, res) {
    const { seats } = req.body;
    if (!seats || seats < 1) {
        return res.status(400).json({ error: 'Le nombre de sièges doit être supérieur à zéro.' });
    }
    try {
        const table = await Tables.createTable(seats);
        console.log('✅ Table created:', table);
        res.status(201).json(table);
    } catch (error) {
        console.error('❌ Error creating table:', error);
        res.status(500).json({ error: error.message });
    }
}

// Update a table (No seat limit for Admin)
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

// Delete a table
export async function deleteTable(req, res) {
    const { id } = req.params;
    try {
        await Tables.deleteTable(id);
        res.json({ message: 'Table deleted successfully' });
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

// Export a default object to allow default import
export default {
    getTables,
    createTable,
    updateTable,
    deleteTable,
    initializeTables
};
