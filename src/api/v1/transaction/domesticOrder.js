const express = require('express');
const router = express.Router();
const domestic_order_service = require('../../../services/transaction/domesticOrder'); // Import Domestic Order Service
const domestic_order = new domestic_order_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Domestic Order Routes
// ========================

router.get('/', auth, domestic_order.listDomesticOrder); // GET
router.get('/admin/get/:id', auth, domestic_order.getDomesticOrder); // GET by ID
router.get('/web/get/:id', domestic_order.getDomesticOrder); // GET by ID
router.post('/create', auth, upload.none(), domestic_order.createDomesticOrder); // POST
router.put('/update/:id', auth, upload.none(), domestic_order.updateDomesticOrder); // PUT by ID
router.delete('/delete/:id', auth, domestic_order.deleteDomesticOrder); // DELETE by ID
router.get('/last', auth, domestic_order.getLastRecordDomesticOrder); // GET
router.put('/update-position-order/:id', auth, upload.none(), domestic_order.updatePositionOrderDomesticOrder); // PUT by ID
router.get('/agen/:agen', auth, domestic_order.listDomesticOrderAgen); // GET
router.get('/member/:member', auth, domestic_order.listDomesticOrderMember); // GET
router.get('/get-order-search-by-field', auth, domestic_order.getDomesticOrderSearchByField); // GET
router.get('/get-order-by-field', auth, domestic_order.getDomesticOrderByField); // GET

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||