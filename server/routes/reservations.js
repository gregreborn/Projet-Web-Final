import express from 'express';
import reservationsController from '../controllers/reservationsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, reservationsController.getReservations);
router.post('/', authenticate, reservationsController.createReservation);
router.put('/:id', authenticate, reservationsController.updateReservation);
router.delete('/:id', authenticate, reservationsController.deleteReservation);

export default router;
