const express = require("express");
const router = express.Router();
const international_order_service = require("../../../services/transaction/internationalOrder"); // Import International Order Service
const international_order = new international_order_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// International Order Routes
// ========================

router.get("/", auth, international_order.listInternationalOrder); // GET
router.get("/admin/get/:id", auth, international_order.getInternationalOrder); // GET by ID
router.get("/web/get/:id", international_order.getInternationalOrder); // GET by ID
router.post(
  "/create",
  auth,
  upload.none(),
  international_order.createInternationalOrder
); // POST
router.put(
  "/update/:id",
  auth,
  upload.none(),
  international_order.updateInternationalOrder
); // PUT by ID
router.delete(
  "/delete/:id",
  auth,
  international_order.deleteInternationalOrderOne
); // DELETE by ID
router.get("/last", auth, international_order.getLastRecordInternationalOrder); // GET
router.put(
  "/update-position-order/:id",
  auth,
  upload.none(),
  international_order.updatePositionOrderInternationalOrder
); // PUT by ID
router.put(
  "/update-by-scan-barcode/:shipment_number",
  auth,
  upload.none(),
  international_order.updateByScanBarcodeInternationalOrder
); // PUT by ID
router.get(
  "/get-filter",
  auth,
  international_order.listInternationalOrderWithFilter
); // GET
router.get(
  "/get-pelanggan",
  auth,
  international_order.listInternationalPelanggan
); // GET

router.get("/agen_general", auth, international_order.listAgenGeneral); // GET

router.get(
  "/get-filter/:position_order",
  auth,
  international_order.listInternationalOrderWithFilter
); // GET
router.get(
  "/get-filter-surat-jalan",
  auth,
  international_order.listInternationalOrderWithFilterSuratJalan
); // GET
router.get(
  "/get-filter-agen/:agen",
  auth,
  international_order.listInternationalAgen
); // GET
router.get(
  "/get-filter-member/:member",
  auth,
  international_order.listInternationalMember
); // GET
router.post(
  "/import",
  upload.single("uploadfile"),
  auth,
  international_order.importTransaction
); // POST Import Transaction
router.delete(
  "/reset-data",
  auth,
  international_order.deleteInternationalOrderAll
); // Reset
router.get(
  "/get-total-order",
  auth,
  international_order.getTotalInternationalOrder
); // GET
router.get(
  "/get-total-order/:agen",
  auth,
  international_order.getTotalInternationalOrder
); // GET
router.get(
  "/get-order-search-by-field",
  auth,
  international_order.getInternationalOrderSearchByField
); // GET
router.get(
  "/get-order-by-field",
  auth,
  international_order.getInternationalOrderByField
); // GET
router.get(
  "/get-total-order-notification",
  auth,
  international_order.getTotalInternationalOrderNotification
); // GET
router.get(
  "/get-filter-all-agen",
  auth,
  international_order.listInternationalAllAgen
); // GET
router.get("/auto-manifest", auth, international_order.AutoManifestTransaction); // GET
router.get(
  "/get-total-shipment-fee",
  auth,
  international_order.TotalShipmentFee
); // GET
router.get(
  "/advance-search",
  auth,
  international_order.AdvanceSearchTransaction
); // GET
router.put("/reset-manifest/:id", auth, international_order.ResetManifest); // GET

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
