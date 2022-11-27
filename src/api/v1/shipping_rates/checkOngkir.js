const express = require("express");
const router = express.Router();
const check_ongkir_service = require("../../../services/shipping_rates/checkOngkir"); // Import Check Ongkir Service
const check_ongkir = new check_ongkir_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const upload = multer();
/* Import Middleware */
// const auth = require('../middleware/auth');

// ========================
// Check Ongkir Consume APIs Routes
// ========================

router.get("/city", check_ongkir.getCity); // GET City
router.get("/district/:id", check_ongkir.getSubDistrict); // GET City By Province
router.get("/city/:id", check_ongkir.getCityByProvince); // GET City By Province
router.get("/province", check_ongkir.getProvince); // GET Province
router.post("/cost", upload.none(), check_ongkir.checkCost); // POST Check Cost

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
