const express = require('express');
const router = express.Router();
const page_setting_service = require('../../../services/master/pageSetting'); // Import Bank Service
const page_setting = new page_setting_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Page Setting Routes
// ========================

router.post('/create', auth, upload.none(), page_setting.createPageSetting); // POST
router.get('/get', page_setting.getPageSetting); // GET by ID
router.put('/update/:id', auth, upload.none(), page_setting.updatePageSetting); // PUT by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||