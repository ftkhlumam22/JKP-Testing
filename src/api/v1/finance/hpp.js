const express = require("express");
const router = express.Router();
const pembayaran_hpp = require("../../../services/finance/bayarHpp"); // Import Piutang Agen Service
const hpp = new pembayaran_hpp(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Piutang Agen Routes
// ========================

router.get("/", auth, hpp.getPembayaranHpp); // GET Piutang Agen
router.get("/detail-list", auth, hpp.getDetailHpp);
router.post("/pay", auth, upload.none(), hpp.payHpp); // POST Piutang Agen

router.get("/export", auth, hpp.exportTemplateHpp); // GET
router.post(
  "/import",
  upload.single("uploadfile"),
  auth,
  hpp.importTransaksiHpp
); // POST

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
