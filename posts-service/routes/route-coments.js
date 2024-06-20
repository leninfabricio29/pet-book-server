const express = require('express');
const { createComment, getCommentById} = require('../controllers/controller-comments');
const router = express.Router();

router.post('/new', createComment);
router.get('/:id', getCommentById);

module.exports = router;
