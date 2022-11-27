const express = require("express");
const router = express.Router();
const piutang_agen_service = require("../../../services/finance/piutangAgen"); // Import Piutang Agen Service
const piutang_agen = new piutang_agen_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Piutang Agen Routes
// ========================

router.get("/", auth, piutang_agen.getPiutangAgen); // GET Piutang
router.get("/count", auth, piutang_agen.totalPiutangAgen); // GET Piutang Agen
router.get("/count-all", auth, piutang_agen.totalPiutangAgenAll); // GET Piutang Agen totalPiutangAgenAll
router.post("/pay", auth, upload.none(), piutang_agen.payPiutangAgen); // POST Piutang Agen

router.get("/export", auth, piutang_agen.exportTemplatePiutangAgen); // GET
router.post(
  "/import",
  upload.single("uploadfile"),
  auth,
  piutang_agen.importPiutangAgen
); // POST

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
