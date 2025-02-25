const express = require('express');
const router = express.Router();
const tablesController = require('../controllers/tablesController');

// Routes
router.get('/', tablesController.getTables);
router.post('/', tablesController.createTable);
router.put('/:id', tablesController.updateTable);
router.delete('/:id', tablesController.deleteTable);

module.exports = router; // ✅ Ensure this line exists
