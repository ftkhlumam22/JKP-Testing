const express = require('express');
const router = express.Router();
const branch_service = require('../../../services/master/branch'); // Import Branch Service
const branch = new branch_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Branch Routes
// ========================

router.get('/admin', auth, branch.listBranch); // GET
router.get('/web', branch.listBranch); // GET
router.get('/get/:id', auth, branch.getBranch); // GET by ID
router.post('/create', auth, upload.none(), branch.createBranch); // POST
router.put('/update/:id', auth, upload.none(), branch.updateBranch); // PUT by ID
router.delete('/delete/:id', auth, branch.deleteBranch); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||