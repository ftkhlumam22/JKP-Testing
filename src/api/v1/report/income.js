const express = require("express");
const router = express.Router();
const income_service = require("../../../services/report/income"); // Import Income Service
const income = new income_service(); // Instance Object

const income_domestik = require("../../../services/report/incomeDomestik");
const incomeDomestik = new income_domestik();
// Enable Multipart Input with Multer
const multer = require("multer");
const upload = multer();
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Agen Routes
// ========================
// Dashboard International
router.get("/get-omzet", auth, income.getOmzet); // GET Omzet
router.get("/get-omzet-real", auth, income.getOmzetReal); // GET Omzet
router.get("/get-statistics-omzet", auth, income.getStatisticOmzet); // GET Omzet
router.get("/get-order", auth, income.getOrder); // GET Order
router.get("/get-weight", auth, income.getWeight); // GET Weight
router.get("/get-order-statistics", auth, income.getOrderStatistics); // GET Order Statistics
router.get("/order-transactions", auth, income.getAdminTransactions); // GET Admin Statistics
router.get("/order-agen-transactions", auth, income.getAgenTransactions); // GET Agen Statistics
router.get("/get-omzet-agen-list", auth, income.getOmzetAgenList); // GET Omzet Agen List

// Dashboard Domestik
router.get("/get-omzet-domestik", auth, incomeDomestik.getOmzetDomestik);
router.get("/get-order-domestik", auth, incomeDomestik.getOrderDomestik);
router.get(
  "/get-domestik-statistics",
  auth,
  incomeDomestik.getStatisticsDomestik
);
router.get("/get-weight-domestik", auth, incomeDomestik.getWeightDomestik);
router.get(
  "/order-transactions-domestik",
  auth,
  incomeDomestik.getAdminTransactionsDomestik
);
module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
