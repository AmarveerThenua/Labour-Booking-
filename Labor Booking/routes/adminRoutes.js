const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const bookingController = require('../controllers/bookingController');

// Admin Panel
router.get('/panel', adminController.getAdminPanel);

router.get('/bookings', bookingController.getAllBookings);

module.exports = router;
