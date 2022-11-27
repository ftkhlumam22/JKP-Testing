const express = require('express');
const router = express.Router();
const trackingmore_service = require('../../../services/tracking/trackingmore'); // Import TrackingMore Service
const trackingMore = new trackingmore_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
// const auth = require('../middleware/auth');


// ========================
// TrackingMore Consume APIs Routes
// ========================

router.get('/get-order/:id', trackingMore.getOrder); // GET Order
router.get('/', trackingMore.getTracking); // GET Tracking Report
router.post('/', upload.none(), trackingMore.createShipment); // POST Create Order TrackingMore

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||