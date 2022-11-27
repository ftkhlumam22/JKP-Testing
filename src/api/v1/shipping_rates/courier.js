const express = require('express');
const router = express.Router();
const courier_service = require('../../../services/shipping_rates/courier'); // Import Courier Service
const courier = new courier_service(); // Instance Object
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/* Import Middleware */
const auth = require('../../../middleware/auth');

// ========================
// Courier Consume APIs Routes
// ========================

router.post('/create', upload.none(), auth, courier.createCourier); // POST Create Courier
router.post('/import', upload.single("uploadfile"), auth, courier.importCourier); // POST Import Courier
router.get('/admin', auth, courier.listCourier); // GET Courier
router.get('/web', courier.listCourier); // GET Courier
router.get('/get/:id', auth, courier.getCourier); // GET by ID
router.put('/update/:id', auth, upload.none(), courier.updateCourier); // PUT by ID
router.delete('/delete/:id', auth, courier.deleteCourier); // DELETE by ID
router.delete('/delete-all', auth, courier.deleteManyCourier); // DELETE All Data

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||