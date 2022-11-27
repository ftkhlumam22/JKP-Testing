const express = require('express');
const router = express.Router();
const member_service = require('../../../services/users/member'); // Import Member Service
const member = new member_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Member Routes
// ========================

router.get('/get', auth, member.listMember); // GET
router.get('/get/:id', auth, member.getMember); // GET by ID
router.post('/create/admin', auth, upload.none(), member.createMember); // POST
router.post('/create/web', upload.none(), member.createMember); // POST
router.put('/update/:id', auth, upload.none(), member.updateMember); // PUT by ID
router.delete('/delete/:id', auth, member.deleteMember); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||