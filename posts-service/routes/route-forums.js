const express = require('express');
const { createForum, getForums, getForumById, updateForum, deleteForum } = require('../controllers/controller-forums');
const router = express.Router();

router.post('/new', createForum);
router.get('/all', getForums);
router.get('/:id', getForumById);
router.put('/:id', updateForum);
router.delete('/:id', deleteForum);

module.exports = router;
