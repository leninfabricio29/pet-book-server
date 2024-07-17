const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const postController = require('../controllers/controller-post');

// Ruta para crear una nueva publicación
router.post('/new', upload, postController.createPost);

router.get('/list', postController.getPostsAll);


// Ruta para actualizar los detalles de una publicación existente
router.patch('/:id', postController.updatePost);

// Ruta para eliminar una publicación
router.delete('/:id', postController.deletePost);

// Ruta para obtener una publicación por su ID
router.get('/:id', postController.getPostById);

// Ruta para obtener todas las publicaciones de un usuario por su ID
router.get('/user/:id', postController.getPostByUserId);

// Ruta para obtener todas las publicaciones
router.get('/', postController.getPost);



module.exports = router;
