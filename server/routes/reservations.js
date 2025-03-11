const express = require('express');
const router = express.Router();
const reservationsController = require('../controllers/reservationsController'); // ✅ Ensure correct import
const { authenticate } = require('../middleware/auth'); // ✅ Ensure correct import

// ✅ Allow public users to access reservation data
router.get('/', authenticate, reservationsController.getReservations);
// ✅ Require authentication for protected actions
router.post('/', authenticate, reservationsController.createReservation);
router.put('/:id', authenticate, reservationsController.updateReservation);
router.delete('/:id', authenticate, reservationsController.deleteReservation);

module.exports = router;