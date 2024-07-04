const express = require('express')
const notificationController = require('../controllers/controller-notifications');
const router = express.Router()

router.post('/new', notificationController.createNotifications);

router.post('/profile/notifications', notificationController.getNotificationByProfileId);

router.put('/:id', notificationController.updateNotification);

module.exports = router;