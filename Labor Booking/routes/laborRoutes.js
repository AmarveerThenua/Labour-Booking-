const express = require('express');
const router = express.Router();
const laborController = require('../controllers/laborController');
const bookingController = require('../controllers/bookingController');


// Labor Dashboard GET
router.get('/dashboard', laborController.getLaborDashboard);

// Labor Details POST
router.post('/dashboard', laborController.postLaborDetails);

router.get('/requests', laborController.getLaborRequests);

router.get('/profile', laborController.viewLaborProfile);

router.post('/reject/:bookingId', laborController.rejectRequest);
router.post('/accept/:bookingId', laborController.acceptRequest);




module.exports = router;
