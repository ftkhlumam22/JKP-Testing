const express = require("express");
const router = express.Router();
const backup_service = require("../../../services/master/backup"); // Import Backup Service
const backup = new backup_service(); // Instance Object

// international
const backup_international = require("../../../services/master/backupInternational"); // Import Backup International
const backupInter = new backup_international();

// domestik
const backup_domestik = require("../../../services/master/backupDomestik"); // Import Backup International
const backupDomestic = new backup_domestik();

// Enable Multipart Input with Multer
const multer = require("multer");
const upload = multer();
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Backup Routes
// ========================

router.get(
  "/transaction-international",
  auth,
  backup.backupTransactionInternational
); // GET | Done
router.get("/backup-international", auth, backupInter.internationalBackup); // GET | Done
router.get("/backup-domestik", auth, backupDomestic.backupTransactionDomestic); // GET | Done

router.get("/transaction-domestic", auth, backup.backupTransactionDomestic); // GET | Done
router.get("/customer", auth, backup.backupCustomer); // GET | Done
router.get("/pickup", auth, backup.backupPickup); // GET | Done
router.get("/tagihan-mitra", auth, backup.backupTagihanMitra); // GET | Done
router.get("/biaya-operasional", auth, backup.backupBiayaOperasional); // GET | DonecategoryBackupOperasional
router.get("/category-biaya", auth, backup.categoryBackupOperasional); // GET | Done
router.get("/piutang-agen", auth, backup.backupPiutangAgen); // GET | Done
router.get("/get-operasional", auth, backup.backupOperasional);

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
