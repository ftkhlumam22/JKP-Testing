const express = require('express');
const router = express.Router();
const service_service = require('../../../services/shipping_rates/service'); // Import Service Service
const service = new service_service(); // Instance Object
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/* Import Middleware */
const auth = require('../../../middleware/auth');

// ========================
// Service Consume APIs Routes
// ========================

router.post('/create', upload.none(), auth, service.createService); // POST Create Service
router.post('/import', upload.single("uploadfile"), auth, service.importService); // POST Import Service
router.get('/admin', auth, service.listService); // GET Service
router.get('/web', service.listService); // GET Service
router.get('/get/:id', auth, service.getService); // GET by ID
router.put('/update/:id', auth, upload.none(), service.updateService); // PUT by ID
router.delete('/delete/:id', auth, service.deleteService); // DELETE by ID
router.delete('/delete-all', auth, service.deleteManyService); // DELETE All Data

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||