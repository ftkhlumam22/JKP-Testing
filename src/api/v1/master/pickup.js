const express = require('express');
const router = express.Router();
const pickup_service = require('../../../services/master/pickup'); // Import Pickup Service
const pickup = new pickup_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Pickup Routes
// ========================

router.get('/', auth, pickup.listPickup); // GET
router.get('/get/:id', auth, pickup.getPickup); // GET by ID
router.post('/create', auth, upload.none(), pickup.createPickup); // POST
router.put('/update/:id', auth, upload.none(), pickup.updatePickup); // PUT by ID
router.delete('/delete/:id', auth, pickup.deletePickup); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||