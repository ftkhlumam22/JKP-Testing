const express = require('express');
const router = express.Router();
const destination_service = require('../../../services/shipping_rates/destination'); // Import Destination Service
const destination = new destination_service(); // Instance Object
const multer = require('multer'); // Import multer

/* -> Multer Upload Storage */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/destination/')
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
// Destination Consume APIs Routes
// ========================

router.get('/', destination.listDestination); // GET Destination
router.post('/', upload.none(), destination.createDestination); // POST Create Destination
router.post('/import', upload.single("uploadfile"), destination.importDestination); // POST Import Destination

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||