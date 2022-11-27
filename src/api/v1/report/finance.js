const express = require('express');
const router = express.Router();
const finance_service = require('../../../services/report/finance'); // Import Income Service
const finance = new finance_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Agen Routes
// ========================

router.get('/get-report', auth, finance.getReportFinance); // GET Report Finance
router.get('/download-report', auth, finance.downloadReportFinance); // DOWNLOAD Report Finance

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||