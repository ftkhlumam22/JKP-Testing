const express = require('express');
const router = express.Router();
const job_service = require('../../../services/master/job'); // Import Job Service
const job = new job_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Job Routes
// ========================

router.get('/admin', auth, job.listJob); // GET
router.get('/web', job.listJob); // GET
router.get('/get/:id', auth, job.getJob); // GET by ID
router.post('/create', auth, upload.none(), job.createJob); // POST
router.put('/update/:id', auth, upload.none(), job.updateJob); // PUT by ID
router.delete('/delete/:id', auth, job.deleteJob); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||