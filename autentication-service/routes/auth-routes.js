const express = require('express');
const authController = require('../controllers/auth-controller');
const router = express.Router();

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/resetPassword', authController.resetPassword);

module.exports = router;
