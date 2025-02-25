const express = require('express');
const router = express.Router();
const reservationsController = require('../controllers/reservationsController'); // ✅ Ensure correct import
const { authenticate } = require('../middleware/auth'); // ✅ Ensure correct import

router.get('/', authenticate, reservationsController.getReservations);  // ✅ Fix this line
router.post('/', authenticate, reservationsController.createReservation);

module.exports = router;
