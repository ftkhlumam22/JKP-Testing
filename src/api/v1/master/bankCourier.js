const express = require('express');
const router = express.Router();
const bank_courier_service = require('../../../services/master/bankCourier'); // Import Bank Courier Service
const bank_courier = new bank_courier_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Bank Routes
// ========================

router.get('/admin', auth, bank_courier.listBankCourier); // GET
router.get('/web', bank_courier.listBankCourier); // GET
router.get('/get/:id', auth, bank_courier.getBankCourier); // GET by ID
router.post('/create', auth, upload.none(), bank_courier.createBankCourier); // POST
router.put('/update/:id', auth, upload.none(), bank_courier.updateBankCourier); // PUT by ID
router.delete('/delete/:id', auth, bank_courier.deleteBankCourier); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||