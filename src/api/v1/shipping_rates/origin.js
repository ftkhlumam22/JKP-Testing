const express = require('express');
const router = express.Router();
const origin_service = require('../../../services/shipping_rates/origin'); // Import Origin Service
const origin = new origin_service(); // Instance Object
const multer = require('multer'); // Import multer

/* -> Multer Upload Storage */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/origin/')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});
// Enable Multipart Input with Multer
const upload = multer({storage: storage});

/* Import Middleware */
// const auth = require('../middleware/auth');

// ========================
// Origin Consume APIs Routes
// ========================

router.get('/', origin.listOrigin); // GET Origin
router.post('/', upload.none(), origin.createOrigin); // POST Create Origin
router.post('/import', upload.single("uploadfile"), origin.importOrigin); // POST Import Origin

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||