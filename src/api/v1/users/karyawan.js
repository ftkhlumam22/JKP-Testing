const express = require("express");
const router = express.Router();
const karyawan = require("../../../services/users/karyawan"); // Import Agen Service
// Enable Multipart Input with Multer
const multer = require("multer");
const upload = multer();
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Agen Routes
// ========================
router.get("/get", auth, karyawan.getKaryawan); // GET
router.get("/get-all", auth, karyawan.getAllKaryawan); // GET
router.get("/get/:id", auth, karyawan.getIdKaryawan); // GET by ID
router.post("/create/admin", auth, upload.none(), karyawan.postKaryawan); // POST
router.put("/update/:id", auth, upload.none(), karyawan.updateKaryawan); // PUT by ID
router.delete("/delete/:id", auth, karyawan.deleteKaryawan); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
