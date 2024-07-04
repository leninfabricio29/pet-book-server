const express = require('express');
const { reactionCreate, checkUserReaction} = require('../controllers/controller-reactions');
const router = express.Router();

router.post('/new', reactionCreate);
router.get('/check', checkUserReaction);

module.exports = router;
