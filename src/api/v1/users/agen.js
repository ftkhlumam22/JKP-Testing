const express = require('express');
const router = express.Router();
const agen_service = require('../../../services/users/agen'); // Import Agen Service
const agen = new agen_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Agen Routes
// ========================

router.get('/get', auth, agen.listAgen); // GET
router.get('/get/:id', auth, agen.getAgen); // GET by ID
router.post('/create/admin', auth, upload.none(), agen.createAgen); // POST
router.post('/create/web', upload.none(), agen.createAgen); // POST
router.put('/update/:id', auth, upload.none(), agen.updateAgen); // PUT by ID
router.delete('/delete/:id', auth, agen.deleteAgen); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||