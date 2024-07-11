const express = require('express');
const router = express.Router();
const eventController = require('../controllers/controller-events');

// Ruta para crear un nuevo evento
router.post('/new', eventController.createEvent);
router.get('/all', eventController.getEvents);
router.post('/save', eventController.saveEvents);
router.get('/:id', eventController.getEventsByUserId);
router.get('/users-events/:id', eventController.getUsersInEvents)

module.exports = router;
