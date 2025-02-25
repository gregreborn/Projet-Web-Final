const express = require('express');
const router = express.Router();
const reservationsController = require('../controllers/reservationsController');
const authenticate = require('../middleware/auth');

router.get('/', authenticate, reservationsController.getReservations);
router.post('/', authenticate, reservationsController.createReservation);

module.exports = router;
