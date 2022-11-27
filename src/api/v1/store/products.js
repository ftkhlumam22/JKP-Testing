const express = require("express");
const router = express.Router();
const productController = require("../../../services/store/products");
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Biaya Operasional Routes
// ========================

router.get("/", auth, productController.getProduct); // GET
router.get("/get/:id", auth, productController.getProductById); // GET by ID
router.post("/create", auth, upload.none(), productController.createProduct); // POST
router.put("/update/:id", auth, upload.none(), productController.updateProduct); // PUT by ID
router.delete("/delete/:id", auth, productController.deleteProduct); // DELETE by ID
module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
