const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/google-login', userController.googleLogin);
router.get('/profile', authMiddleware, userController.getUserProfile);
router.patch('/profile', authMiddleware, userController.updateUserProfile);

module.exports = router;
