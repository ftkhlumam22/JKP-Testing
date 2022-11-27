const express = require('express');
const router = express.Router();
const international_service = require('../../../services/booking/international'); // Import Booking Domestic Service
const international = new international_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// International Routes
// ========================

router.get('/get', auth, international.listBookingInternational); // GET
router.get('/get/:id', auth, international.getBookingInternational); // GET by ID
router.post('/create/admin', auth, upload.none(), international.createBookingInternational); // POST
router.post('/create/web', upload.none(), international.createBookingInternational); // POST
router.put('/update/:id', auth, upload.none(), international.updateBookingInternational); // PUT by ID
router.delete('/delete/:id', auth, international.deleteBookingInternational); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||