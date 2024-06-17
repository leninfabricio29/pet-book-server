const express = require('express');
const router = express.Router();
const validateCi = require ('../middleware/validate-ci')
const userController = require('../controllers/user-controller');

router.get('/list', userController.getUsers);
router.post('/new', userController.createUser);
router.get('/:id', userController.getUserById),
router.get('/email/:email', userController.getUserByEmail),
router.post('/:email/updatePassword',userController.updatePassword);



module.exports = router;
