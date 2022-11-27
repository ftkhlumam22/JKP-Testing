const express = require('express');
const router = express.Router();
const user_report_service = require('../../../services/report/user'); // Import User Report Service
const user_report = new user_report_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// User Report Routes
// ========================

router.get('/get-agen', auth, user_report.getTotalNewAgen); // GET Total New Agen
router.get('/get-member', auth, user_report.getTotalNewMember); // GET Total New Member
router.get('/get-user', auth, user_report.getTotalNewUser); // GET Total New User
router.get('/get-agen-statistics', auth, user_report.getAgenStatistics); // GET Agen Statistics
router.get('/get-member-statistics', auth, user_report.getMemberStatistics); // GET Member Statistics

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||