const express = require("express");
const router = express.Router();
const ordersController = require("../../../services/store/orders");
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Biaya Operasional Routes
// ========================

router.get("/", auth, ordersController.getOrders); // GET
router.post("/create", auth, upload.none(), ordersController.createOrders); // POST
router.post("/delete", auth, upload.none(), ordersController.deleteOrders); // DELETE
router.post("/update", auth, upload.none(), ordersController.updateOrders); // UPDATE
router.get("/backup", auth, ordersController.backupOrders); // GET BY ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
