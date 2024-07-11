// routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile-controller');

const upload = require('../middleware/upload');

// Ruta para crear un nuevo perfil
router.post('/new', upload, profileController.createProfile);

router.get('/all', profileController.getProfiles)

router.put('/update/:id', profileController.updateProfile);

// Ruta para obtener perfil y usuario por id (usuario)
router.get('/:id', profileController.getProfileByUserId);

//Ruta para obtener follwers
router.get('/followers/:id', profileController.getFollowerProfile);

//Ruta para obtener siguiendo
router.get('/following/:id', profileController.getFollowingProfile);


// Ruta para actualizar los detalles de un perfil existente
router.patch('/:id', profileController.updateProfile);

// Ruta para eliminar un perfil
router.delete('/:id', profileController.deleteProfile);

//Ruta seguir perfiles
router.post('/follow', profileController.addFollower);

//Ruta dejar de seguir perfiles
router.post('/unfollow', profileController.removeFollower);

module.exports = router;
