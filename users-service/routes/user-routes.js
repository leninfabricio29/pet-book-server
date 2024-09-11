const express = require('express');
const router = express.Router();
const validateCi = require ('../middleware/validate-ci')
const userController = require('../controllers/user-controller');

router.get('/list', userController.getUsers);
router.get('/allUsers', userController.getUsersAll);
router.post('/new', userController.createUser);
router.get('/:id', userController.getUserById),
router.post('/:id/delete', userController.deleteUser)
router.get('/email/:email', userController.getUserByEmail),
router.post('/:email/updatePassword',userController.updatePassword);
router.post('/:userId/updateInteraction', userController.updateInteraction)



module.exports = router;
