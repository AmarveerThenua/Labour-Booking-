const express = require('express');
const router = express.Router();
const laborController = require('../controllers/laborController');
const bookingController = require('../controllers/bookingController');
const upload = require('../middleware/upload');



// Labor Dashboard GET
router.get('/dashboard', laborController.getLaborDashboard);

// Labor Details POST


router.get('/requests', laborController.getLaborRequests);

router.get('/profile', laborController.viewLaborProfile);

router.get('/home', laborController.getLaborHome);


router.post('/dashboard', upload.single('profileImage'), laborController.postLaborDetails);

router.post('/reject/:bookingId', laborController.rejectRequest);
router.post('/accept/:bookingId', laborController.acceptRequest);
router.post("/complete/:bookingId", laborController.completeBooking);





module.exports = router;
