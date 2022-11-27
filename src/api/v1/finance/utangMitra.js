const express = require("express");
const router = express.Router();
const utangMitra_service = require("../../../services/finance/utangMitra"); // Import Utang Mitra Service
const utangMitra = new utangMitra_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Utang Mitra Routes
// ========================

router.get("/", auth, utangMitra.listUtangMitra); // GET
router.get("/getSumMitra", auth, utangMitra.countAllMitra); // GET
router.get("/get/:id", auth, utangMitra.getUtangMitra); // GET by ID
router.post("/create", auth, upload.none(), utangMitra.createUtangMitra); // POST
router.put("/update/:id", auth, upload.none(), utangMitra.updateUtangMitra); // PUT by ID
router.delete("/delete/:id", auth, utangMitra.deleteUtangMitra); // DELETE by ID

router.get("/export", auth, utangMitra.exportTemplateUtangMitra); // GET
router.post(
  "/import",
  upload.single("uploadfile"),
  auth,
  utangMitra.importUtangMitra
); // POST

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
