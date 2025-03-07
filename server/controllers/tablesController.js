const Tables = require('../models/tablesModel');
const pool = require('../db');

// Get all tables
exports.getTables = async (req, res) => {
    try {
        const tables = await Tables.getAllTables();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create a table
exports.createTable = async (req, res) => {
    const { seats } = req.body;
    if (!seats || seats < 2 || seats > 6) {
        return res.status(400).json({ error: 'Seats must be between 2 and 6' });
    }

    try {
        const table = await Tables.createTable(seats);
        res.status(201).json(table);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a table
exports.updateTable = async (req, res) => {
    const { id } = req.params;
    const { seats } = req.body;

    try {
        const updatedTable = await Tables.updateTable(id, seats);
        res.json(updatedTable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a table
exports.deleteTable = async (req, res) => {
    const { id } = req.params;

    try {
        await Tables.deleteTable(id);
        res.json({ message: 'Table deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
