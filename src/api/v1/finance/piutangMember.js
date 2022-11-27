const express = require("express");
const router = express.Router();
const piutang_member_service = require("../../../services/finance/piutangMember"); // Import Piutang Member Service
const piutang_member = new piutang_member_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Piutang Member Routes
// ========================

router.get("/", auth, piutang_member.getPiutangMember); // GET Piutang Member
router.get("/count", auth, piutang_member.totalPiutangPelanggan); // GET Piutang Pelanggan
router.get("/count-all", auth, piutang_member.totalPiutangPelangganAll); // GET Piutang Pelanggan

router.get("/detail-list", auth, piutang_member.getDetailListPiutangMember); // GET Detail List Piutang Member
router.post("/pay", auth, upload.none(), piutang_member.payPiutangMember); // POST Piutang Member

router.get("/export", auth, piutang_member.exportTemplatePiutangMember); // GET
router.post(
  "/import",
  upload.single("uploadfile"),
  auth,
  piutang_member.importPiutangMember
); // POST

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
