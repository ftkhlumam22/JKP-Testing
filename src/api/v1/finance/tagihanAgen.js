const express = require('express');
const router = express.Router();
const tagihanAgen_service = require('../../../services/finance/tagihanAgen'); // Import Biaya Operasional Service
const tagihanAgen = new tagihanAgen_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Tagihan Agen Routes
// ========================

router.get('/', auth, tagihanAgen.listTagihanAgen); // GET
router.get('/:id', auth, tagihanAgen.getTagihanAgen); // GET by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||