const express = require('express');
const router = express.Router();
const bank_service = require('../../../services/master/bank'); // Import Bank Service
const bank = new bank_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Bank Routes
// ========================

router.get('/admin', auth, bank.listBank); // GET
router.get('/web', bank.listBank); // GET
router.get('/get/:id', auth, bank.getBank); // GET by ID
router.post('/create', auth, upload.none(), bank.createBank); // POST
router.put('/update/:id', auth, upload.none(), bank.updateBank); // PUT by ID
router.delete('/delete/:id', auth, bank.deleteBank); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||