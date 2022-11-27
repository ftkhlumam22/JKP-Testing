const express = require('express');
const router = express.Router();
const user_service = require('../../../services/users/users'); // Import User Service
const user = new user_service(); // Instance Object
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/* Import Middleware */
const auth = require('../../../middleware/auth');

// ========================
// User Consume APIs Routes
// ========================

router.post('/create', upload.none(), auth, user.createUser); // POST Create User
router.post('/import', upload.single("uploadfile"), auth, user.importUser); // POST Import User
router.get('/', auth, user.listUser); // GET User
router.get('/get/:id', auth, user.getUser); // GET by ID
router.put('/update/:id', auth, upload.none(), user.updateUser); // PUT by ID
router.delete('/delete/:id', auth, user.deleteUser); // DELETE by ID
router.delete('/delete-all', auth, user.deleteManyUser); // DELETE All Data

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||