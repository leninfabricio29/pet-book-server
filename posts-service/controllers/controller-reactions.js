const Reaction = require('../models/reaction');
const Post = require('../models/post');
const axios = require('axios');

// Controlador para crear una nueva reacción
const reactionCreate = async (req, res) => {
  try {
    const { userId, postId } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!userId || !postId) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar que la publicación existe
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Publicación no encontrada' });
    }

    // Comprobar si ya existe una reacción por el mismo usuario a la misma publicación
    const existingReaction = await Reaction.findOne({ user: userId, post: postId });
    if (existingReaction) {
      return res.status(409).json({ error: 'Ya has reaccionado a esta publicación' });
    }

    // Crear la nueva reacción
    const newReaction = new Reaction({
      user: userId,
      post: postId
    });

    // Crear una nueva notificación
    const newNotification = {
      type: 'like',
      emiter_id: userId,
      receiver_id: post.owner,
      post_id: post._id
    };

    // Enviar la nueva notificación al microservicio de notificaciones
    const notificationResponse = await axios.post('http://localhost:3010/api/v1/notifications/new', {
      notifications: [newNotification]
    });
    const savedNotifications = notificationResponse.data;

    // Obtener el perfil del propietario de la publicación
    const profileResponse = await axios.get(`http://localhost:3010/api/v1/profiles/${post.owner}`);
    const perfil = profileResponse.data.profile;

    if (!perfil) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    // Asegurarse de que perfil.notifications sea un array antes de push
    if (!perfil.notifications || !Array.isArray(perfil.notifications)) {
      perfil.notifications = [];
    }

    // Añadir las notificaciones guardadas al perfil
    perfil.notifications.push(...savedNotifications);

    // Enviar una solicitud para actualizar perfil en la base de datos
    try {
      const updateResponse = await axios.put(`http://localhost:3010/api/v1/profiles/update/${perfil._id}`, {
        notifications: savedNotifications
      });
      console.log('Perfil actualizado:', updateResponse.data);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return res.status(500).json({ error: 'Error al actualizar perfil' });
    }

    // Guardar la nueva reacción
    await newReaction.save();

    // Actualizar la cantidad de reacciones en la publicación
    post.amount_reactions += 1;
    await post.save();

    res.status(201).json(newReaction);
  } catch (error) {
    console.error('Error al crear la reacción:', error);
    res.status(500).json({ error: 'Error al crear la reacción' });
  }
};










const checkUserReaction = async (req, res) => {
    try {
      const { userId, postId } = req.query;

      const user = userId
      const post = postId
  
      if (!userId || !postId) {
        return res.status(400).json({ message: 'User ID and Post ID are required' });
      }
  
      const reaction = await Reaction.findOne({ user, post });

  
      if (reaction) {
        return res.status(200).json({ hasReacted: true });
      } else {
        return res.status(200).json({ hasReacted: false });
      }
    } catch (error) {
      console.error('Error checking user reaction:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };

module.exports ={
    reactionCreate,
    checkUserReaction
}

