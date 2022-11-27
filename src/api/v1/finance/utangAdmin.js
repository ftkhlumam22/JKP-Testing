const express = require("express");
const router = express.Router();
const utangAdmin_service = require("../../../services/finance/utangAdmin"); // Import Utang Mitra Service
const utangAdmin = new utangAdmin_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Utang Mitra Routes
// ========================

router.get("/", auth, utangAdmin.listUtangAdmin); // GET
router.get("/:id", auth, utangAdmin.getUtangAdmin); // GET by ID
router.post("/create", auth, upload.none(), utangAdmin.createUtangMitra); // POST
router.put("/update/:id", auth, upload.none(), utangAdmin.updateUtangAdmin); // PUT by ID
router.delete("/delete/:id", auth, utangAdmin.deleteUtangMitra); // DELETE by ID

router.get("/export", auth, utangAdmin.exportTemplateUtangMitra); // GET
router.post(
  "/import",
  upload.single("uploadfile"),
  auth,
  utangAdmin.importUtangMitra
); // POST

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
