// routes/postRoutes.js

const express = require('express');
const router = express.Router();
const postController = require('../controllers/controller-post');

// Ruta para crear una nueva publicación
router.post('/new', postController.createPost);

// Ruta para actualizar los detalles de una publicación existente
router.patch('/:id', postController.updatePost);

// Ruta para eliminar una publicación
router.delete('/:id', postController.deletePost);

// Ruta para obtener una publicación por su ID
router.get('/allPosts/:id', postController.getPostByUserId);

module.exports = router;
