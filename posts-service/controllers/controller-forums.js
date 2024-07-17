const Forum = require('../models/forum');
const axios = require('axios');
// Crear un nuevo foro
const createForum = async (req, res) => {
    try {
        const { question, date, createdBy } = req.body;
        const newForum = new Forum({ question, date, createdBy });

        // Guardar el nuevo foro en la base de datos
        await newForum.save();

        

        // Obtener todos los perfiles
        const profilesResponse = await axios.get('http://localhost:3010/api/v1/profiles/all');
        const profiles = profilesResponse.data;

        if (!profiles || profiles.length === 0) {
            return res.status(404).json({ error: 'No se encontraron perfiles' });
        }

        // Filtrar los perfiles para excluir al creador del foro
        const filteredProfiles = profiles.filter(profile => profile.user !== createdBy);



        // Crear notificaciones para los perfiles filtrados
        const notifications = filteredProfiles.map(profile => ({
            type: 'foro',
            emiter_id: createdBy,  // ID del creador del foro
            receiver_id: profile._id,
            post_id: newForum._id
        }));

        // Enviar las notificaciones al microservicio de notificaciones
        const notificationResponse = await axios.post('http://localhost:3010/api/v1/notifications/new', {
            notifications: notifications
        });
        const savedNotifications = notificationResponse.data;

        // Limpiar las notificaciones en cada perfil
        for (const profile of filteredProfiles) {
            profile.notifications = [];
        }

        // Agregar las nuevas notificaciones a cada perfil
        for (const profile of filteredProfiles) {
            const newNotification = savedNotifications.find(n => n.receiver_id === profile._id);
            if (newNotification) {
                profile.notifications.push(newNotification);
            }
        }

        // Actualizar cada perfil en la base de datos
        for (const profile of filteredProfiles) {
            try {
                await axios.put(`http://localhost:3010/api/v1/profiles/update/${profile._id}`, {
                    notifications: profile.notifications
                });
            } catch (error) {
                console.error('Error al actualizar perfil:', error);
                return res.status(500).json({ error: 'Error al actualizar perfil' });
            }
        }

        res.status(201).json(newForum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};




// Obtener todos los foros
const getForums = async (req, res) => {
    try {
        const forums = await Forum.find()
            

        res.json(forums);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
};

// Obtener un foro por ID
const getForumById = async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id).populate({
            path: 'answers.commentId',
            model: 'Comment'
        });
        
        


        if (!forum) {
            return res.status(404).json({ error: 'Foro no encontrado' });
        }
        res.status(200).json(forum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un foro
const updateForum = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const forum = await Forum.findByIdAndUpdate(id, updatedData, { new: true });
        if (!forum) {
            return res.status(404).json({ error: 'Foro no encontrado' });
        }
        res.status(200).json(forum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un foro
const deleteForum = async (req, res) => {
    try {
        const { id } = req.params;
        const forum = await Forum.findByIdAndDelete(id);
        if (!forum) {
            return res.status(404).json({ error: 'Foro no encontrado' });
        }
        res.status(200).json({ message: 'Foro eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createForum,
    getForums,
    getForumById,
    updateForum,
    deleteForum
};
