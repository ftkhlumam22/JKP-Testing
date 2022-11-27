const express = require('express');
const router = express.Router();
const check_tariff_service = require('../../../services/shipping_rates/checkTariff'); // Import Check Tariff Service
const check_tariff = new check_tariff_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
// const auth = require('../middleware/auth');


// ========================
// Check Tariff Consume APIs Routes
// ========================

router.get('/', check_tariff.checkCost); // GET Check Tariff

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||