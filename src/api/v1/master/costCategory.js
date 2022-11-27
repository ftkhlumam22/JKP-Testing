const express = require('express');
const router = express.Router();
const cost_category_service = require('../../../services/master/costCategory'); // Import Cost Service
const cost_category = new cost_category_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Cost Category Routes
// ========================

router.get('/', auth, cost_category.listCostCategory); // GET
router.get('/:id', auth, cost_category.getCostCategory); // GET by ID
router.post('/', auth, upload.none(), cost_category.createCostCategory); // POST
router.put('/:id', auth, upload.none(), cost_category.updateCostCategory); // PUT by ID
router.delete('/:id', auth, cost_category.deleteCostCategory); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||