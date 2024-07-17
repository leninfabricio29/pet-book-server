const Notification = require('../models/notification');
const axios = require('axios');

const createNotifications = async (req, res) => {
    try {
        // Crear las nuevas notificaciones en base a los datos enviados en el cuerpo de la solicitud
        const notifications = req.body.notifications;

        if (!notifications || !Array.isArray(notifications)) {
            return res.status(400).json({ error: 'Las notificaciones deben ser un array' });
        }

        // Verificar que todas las notificaciones sean objetos completos
        for (let notification of notifications) {
            if (typeof notification !== 'object') {
                return res.status(400).json({ error: 'Cada notificación debe ser un objeto' });
            }
        }

        // Crear las nuevas notificaciones en la base de datos
        const newNotifications = await Notification.insertMany(notifications);

        // Devolver las notificaciones completas creadas
        res.status(201).json(newNotifications);
    } catch (error) {
        console.error('Error al crear notificaciones:', error);
        res.status(500).json({ error: 'Error al crear notificaciones' });
    }
};



const updateNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;

        // Encuentra la notificación por ID y actualiza el campo 'read' a true
        const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { view: true },
            { new: true } // Esto devuelve el documento actualizado
        );

        if (!updatedNotification) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }

        res.status(200).json(updatedNotification);
    } catch (error) {
        console.error('Error al actualizar la notificación:', error);
        res.status(500).json({ error: 'Error al actualizar la notificación' });
    }
};



const getNotificationByProfileId = async (req, res) => {
    try {
        const { owner } = req.body;

        // Llamar a la API para obtener el perfil
        const profileResponse = await axios.get(`http://localhost:6010/api/v1/profiles/${owner}`);
        const profile = profileResponse.data.profile;

        if (!profile) {
            return res.status(404).json({ message: 'Perfil no encontrado' });
        }

        const notificationIds = profile.notifications;

        if (!notificationIds || notificationIds.length === 0) {
            return res.status(404).json({ message: 'Notificaciones no encontradas' });
        }

        // Buscar todas las notificaciones por sus IDs
        const notifications = await Notification.find({ _id: { $in: notificationIds } });

        if (!notifications || notifications.length === 0) {
            return res.status(404).json({ message: 'Notificaciones no encontradas' });
        }

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error al obtener notificaciones por perfil:', error);
        res.status(500).json({ error: 'Error al obtener notificaciones por perfil' });
    }
};




module.exports = {
    createNotifications,
    getNotificationByProfileId,
    updateNotification
}