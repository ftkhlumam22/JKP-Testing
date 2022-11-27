const express = require('express');
const router = express.Router();
const domestic_service = require('../../../services/booking/domestic'); // Import Booking Domestic Service
const domestic = new domestic_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Domestic Routes
// ========================

router.get('/get', auth, domestic.listBookingDomestic); // GET
router.get('/get/:id', auth, domestic.getBookingDomestic); // GET by ID
router.post('/create/admin', auth, upload.none(), domestic.createBookingDomestic); // POST
router.post('/create/web', upload.none(), domestic.createBookingDomestic); // POST
router.put('/update/:id', auth, upload.none(), domestic.updateBookingDomestic); // PUT by ID
router.delete('/delete/:id', auth, domestic.deleteBookingDomestic); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||