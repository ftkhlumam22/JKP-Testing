const express = require("express");
const router = express.Router();
const tracking_service = require("../../../services/tracking/tracking"); // Import TrackingMore Service
const tracking = new tracking_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const upload = multer();
/* Import Middleware */
// const auth = require('../middleware/auth');

// ========================
// Tracking Consume APIs Routes
// ========================

router.get("/:shipment_number", tracking.getTracking); // GET Tracking
module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
