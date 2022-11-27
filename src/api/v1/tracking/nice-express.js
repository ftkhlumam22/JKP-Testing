const express = require("express");
const router = express.Router();
const nice_express_service = require("../../../services/tracking/nice-express"); // Import Nice Express Service
const nice_express = new nice_express_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const upload = multer();
/* Import Middleware */
// const auth = require('../middleware/auth');

// ========================
// Nice Tracking Consume APIs Routes
// ========================

router.get("/:remark", nice_express.getTracking); // GET Tracking Report

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
