import express from 'express';
import tablesController from '../controllers/tablesController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// ✅ Properly protected routes
router.get('/', authenticate, isAdmin, tablesController.getTables);
router.post('/', authenticate, isAdmin, tablesController.createTable);
router.put('/:id', authenticate, isAdmin, tablesController.updateTable);
router.delete('/:id', authenticate, isAdmin, tablesController.deleteTable);

export default router;
