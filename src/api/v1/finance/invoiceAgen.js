const express = require("express");
const router = express.Router();
const piutang_invoice_service = require("../../../services/finance/invoiceAgen"); // Import Piutang Member Service
const invoice_agen = new piutang_invoice_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Piutang Member Routes
// ========================

router.get("/", auth, invoice_agen.getInvoiceAgen); // GET Piutang Member
router.get("/list-invoice", auth, invoice_agen.getListInvoiceMitra); // GET List
router.get("/count", auth, invoice_agen.totalPiutangPelanggan); // GET Piutang Pelanggan
router.get("/count-all", auth, invoice_agen.totalPiutangPelangganAll); // GET Piutang Pelanggan

router.get("/detail-list", auth, invoice_agen.getDetailListInvoiceAgen); // GET Detail List Piutang Member
router.post("/pay", auth, upload.none(), invoice_agen.payInvoiceAgen); // POST Piutang Member

router.post("/", auth, upload.none(), invoice_agen.createInvoiceAgen); // POST Piutang Member
router.get("/latest-invoice", auth, invoice_agen.getLastRecordInvoice); // POST Piutang Member

router.get("/export", auth, invoice_agen.exportTemplateInvoiceAgen); // GET
router.post(
  "/import",
  upload.single("uploadfile"),
  auth,
  invoice_agen.importInvoiceAgen
); // POST

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
