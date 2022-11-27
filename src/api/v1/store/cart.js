const express = require("express");
const router = express.Router();
const cartController = require("../../../services/store/carts");
// Enable Multipart Input with Multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
/* Import Middleware */
const auth = require("../../../middleware/auth");

// ========================
// Biaya Operasional Routes
// ========================

router.get("/", auth, cartController.getCart); // GET
router.post("/create", auth, upload.none(), cartController.createCart); // POST
router.post("/update-cart", auth, upload.none(), cartController.updateCart); // PUT by ID
router.post(
  "/update-cart-min",
  auth,
  upload.none(),
  cartController.updateCartMinus
); // PUT by ID
router.post("/remove-cart", auth, upload.none(), cartController.deleteCart); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||
