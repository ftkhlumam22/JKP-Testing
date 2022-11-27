const express = require('express');
const router = express.Router();
const role_service = require('../../../services/users/roles'); // Import Role Service
const role = new role_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Role Routes
// ========================

router.get('/', auth, role.listRole); // GET
router.get('/:id', auth, role.getRole); // GET by ID
router.post('/', auth, upload.none(), role.createRole); // POST
router.put('/:id', auth, upload.none(), role.updateRole); // PUT by ID
router.delete('/:id', auth, role.deleteRole); // DELETE by ID

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||