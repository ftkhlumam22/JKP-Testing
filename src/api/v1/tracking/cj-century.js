const express = require('express');
const router = express.Router();
const cj_century_service = require('../../../services/tracking/cj-century'); // Import CJ Century Service
const cj_century = new cj_century_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
// const auth = require('../middleware/auth');


// ========================
// Tabitha Consume APIs Routes
// ========================

router.get('/', cj_century.getTracking); // GET Tracking Report

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||