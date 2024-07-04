const express = require('express');
const { createComment, getCommentById, createCommentPost} = require('../controllers/controller-comments');
const router = express.Router();

router.post('/new', createComment);
router.post('/post/new', createCommentPost);

router.get('/:id', getCommentById);

module.exports = router;
