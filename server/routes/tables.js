const express = require('express');
const router = express.Router();
const tablesController = require('../controllers/tablesController');
const { authenticate, isAdmin } = require('../middleware/auth');

router.get('/', authenticate, tablesController.getTables);
router.post('/', authenticate, isAdmin, tablesController.createTable);
router.put('/:id', authenticate, isAdmin, tablesController.updateTable);
router.delete('/:id', authenticate, isAdmin, tablesController.deleteTable);
router.post('/init', authenticate, isAdmin, tablesController.initializeTables);

module.exports = router;
