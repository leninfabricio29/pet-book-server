// CommentController.js
const Comment = require('../models/comment');
const Post = require('../models/post');
const Forum = require('../models/forum');

const axios = require('axios');

// Crear un nuevo comentario
// Controlador para crear un nuevo comentario en un foro
const createComment = async (req, res) => {
    const { content, forumId } = req.body;

    const userId = req.body.createdBy; // Suponiendo que el usuario actual está autenticado y su ID está disponible en req.user

    try {
        // Verificar si el foro al que se quiere añadir el comentario existe y está activo
        const forum = await Forum.findOne({ _id: forumId, status: 'active' });
        if (!forum) {
            return res.status(404).json({ error: 'Forum not found or inactive' });
        }

        // Crear el nuevo comentario
        const newComment = new Comment({
            content,
            createdBy: userId,
            forum: forumId
        });

        // Guardar el comentario en la base de datos
        const savedComment = await newComment.save();

        // Agregar el comentario al array de respuestas (answers) del foro




        
        forum.answers.push({ commentId: savedComment._id });
        await forum.save();

        res.status(201).json(savedComment); // Devolver el comentario creado
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
};



async function getCommentById(req, res) {
    const { id } = req.params; // ID del comentario a buscar

    try {
        // Buscar el comentario en la base de datos local
        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({ error: 'Comentario no encontrado' });
        }

        // Obtener datos del perfil desde la API externa
        const profileId = comment.createdBy; // Suponiendo que createdBy es directamente el ID del usuario

        const profileResponse = await axios.get(`http://localhost:6010/api/v1/profiles/${profileId}`);


        // Combinar los datos del comentario con los datos del perfil
        const responseData = {
            comment: {
                _id: comment._id,
                content: comment.content,
                createdBy: comment.createdBy, // Aquí podrías incluir más detalles si los necesitas
                forum: comment.forum,
                post: comment.post,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt
            },
            profileData: profileResponse.data // Datos completos del perfil desde la API
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error al obtener el comentario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}


const createCommentPost = async (req, res) => {
    const { content, postId } = req.body;


    // Suponiendo que el usuario actual está autenticado y su ID está disponible en req.user
    const userId = req.body.createdBy;


    try {
        // Verificar si la publicación a la que se quiere añadir el comentario existe y está activa
        const post = await Post.findOne({ _id: postId });

        if (!post) {
            return res.status(404).json({ error: 'No se encuentra la publicación' });
        }

        // Crear el nuevo comentario
        const newComment = new Comment({
            content,
            createdBy: userId,
            post: postId
        });

        // Guardar el comentario en la base de datos
        const savedComment = await newComment.save();


        // Crear una nueva notificación
    const newNotification = {
        type: 'comment',
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

        // Agregar el comentario al array de respuestas (comments) de la publicación
        post.comments.push(savedComment._id);
        post.amount_comments += 1;
        await post.save();

        res.status(201).json(savedComment); // Devolver el comentario creado
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error del servidor' });
    }
}




module.exports = {
    createComment,
    getCommentById,
    createCommentPost,
    

};