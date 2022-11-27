const express = require('express');
const router = express.Router();
const tabitha_service = require('../../../services/tracking/tabitha'); // Import Tabitha Service
const tabitha = new tabitha_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
// const auth = require('../middleware/auth');


// ========================
// Tabitha Consume APIs Routes
// ========================

router.get('/', tabitha.getTracking); // GET Tracking Report
router.post('/', upload.none(), tabitha.createShipment); // POST Create Order TrackingMore

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||