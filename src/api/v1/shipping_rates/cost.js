const express = require('express');
const router = express.Router();
const cost_service = require('../../../services/shipping_rates/cost'); // Import Cost Service
const cost = new cost_service(); // Instance Object
const multer = require('multer'); // Import multer

/* -> Multer Upload Storage */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/cost/')
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
// Cost Consume APIs Routes
// ========================

router.get('/', cost.listCost); // GET Cost
router.get('/get/:id', cost.getCost); // GET Cost by Id
router.put('/update/:id', upload.none(), cost.updateCost); // UPDATE Cost by Id
router.delete('/delete/:id', cost.deleteCost); // DELETE Cost by Id
router.delete('/delete-many', cost.deleteManyCost); // DELETE many Cost
router.post('/', upload.none(), cost.createCost); // POST Create Cost
router.post('/import', upload.single("uploadfile"), cost.importCost); // POST Import Cost

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||