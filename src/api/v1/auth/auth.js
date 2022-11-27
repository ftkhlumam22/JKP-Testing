const express = require('express');
const router = express.Router();
const signup_service = require('../../../services/auth/signup'); // Import Signup Service
const signup = new signup_service(); // Instance Object
const login_service = require('../../../services/auth/login'); // Import Login Service
const login = new login_service(); // Instance Object
// Enable Multipart Input with Multer
const multer = require('multer');
const upload = multer();
/* Import Middleware */
const auth = require('../../../middleware/auth');


// ========================
// Auth Consume APIs Routes
// ========================

router.post('/register', upload.none(), signup.userSignup); // POST Signup
router.post('/login', upload.none(), login.userLogin); // GET Login
router.get('/profile', auth, login.getUserProfile); // GET User Profile

module.exports = router;
// >>>>>>>>>>>>>>>>>>>>>|||