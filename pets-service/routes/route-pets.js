// routes/petRoutes.js

const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const petController = require('../controllers/controller-pets');


router.get('/list', petController.getAllPets);
router.get('/:id', petController.getPetById);
router.post('/new', upload, petController.createPet);
router.put('/:id', petController.updatePet);
router.delete('/:id', petController.deletePet);
router.post('/search',petController.getPetsByUser);
router.post('/change', petController.changeStatusPet);

module.exports = router;
