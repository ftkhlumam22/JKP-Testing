const express = require("express");
const router = express.Router();
const biayaOperasional_service = require("../../../services/finance/biayaOperasional"); // Import Biaya Operasional Service
const biayaOperasional = new biayaOperasional_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Biaya Operasional Routes
// ========================

router.get("/", auth, biayaOperasional.listBiayaOperasional); // GET
router.get("/get/:id", auth, biayaOperasional.getBiayaOperasional); // GET by ID
router.post(
  "/create",
  auth,
  upload.none(),
  biayaOperasional.createBiayaOperasional
); // POST
router.put(
  "/update/:id",
  auth,
  upload.none(),
  biayaOperasional.updateBiayaOperasional
); // PUT by ID
router.delete("/delete/:id", auth, biayaOperasional.deleteBiayaOperasional); // DELETE by ID
router.get("/get-total", auth, biayaOperasional.getTotalBiayaOperasional); // GET
router.get(
  "/get-total-branch",
  auth,
  biayaOperasional.getTotalBiayaOperasionalBranch
); // GET

router.post(
  "/import",
  upload.single("uploadfile"),
  auth,
  biayaOperasional.importBiayaOperasional
); // POST

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
