const Notification = require('../models/notification');

const createNotifications = async (req, res) => {
    try {
        // Crear las nuevas notificaciones en base a los datos enviados en el cuerpo de la solicitud
        const notifications = req.body.notifications;

        if (!notifications || !Array.isArray(notifications)) {
            return res.status(400).json({ error: 'Las notificaciones deben ser un array' });
        }

        // Crear las nuevas notificaciones en la base de datos
        const newNotifications = await Notification.insertMany(notifications);

        // Devolver los IDs de las notificaciones creadas
        const notificationIds = newNotifications.map(notification => notification._id);

        res.status(201).json(notificationIds);
    } catch (error) {
        console.error('Error al crear notificaciones:', error);
        res.status(500).json({ error: 'Error al crear notificaciones' });
    }
};

const getNotifications = async (req, res, next) => {

}

module.exports = {
    createNotifications,
    getNotifications
};