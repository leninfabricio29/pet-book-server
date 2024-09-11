const Post = require('../models/post');
const cloudinary = require('../config/cloudinary');
const axios = require("axios")


// Controlador para crear una nueva publicación
// Controlador de la API
const createPost = async (req, res) => {
    let { type, body, coordinates, reward, owner, pet } = req.body;
    let photo_url = '';
  
    try {
      // Verificar tipo de publicación
      switch (type) {
        case 'Perdida':
        case 'Avistamiento':
          // Coordenadas son requeridas para estos tipos de publicación
          if (!coordinates) {
            return res.status(400).json({ error: 'Las coordenadas son requeridas para este tipo de publicación' });
          }
          break;
        case 'Adopcion':
          // Coordenadas no son requeridas para este tipo de publicación
          coordinates = [-3.995008843716655, -79.20786376590335];
          break;
        default:
          return res.status(400).json({ error: 'Tipo de publicación no válido' });
      }
  
      // Analizar coordinates si se recibió como cadena JSON
      let parsedCoordinates = [];
      if (typeof coordinates === 'string') {
        try {
          parsedCoordinates = JSON.parse(coordinates);
        } catch (error) {
          return res.status(400).json({ error: 'Las coordenadas tienen un formato incorrecto' });
        }
      } else if (Array.isArray(coordinates)) {
        parsedCoordinates = coordinates;
      }
  
      // Subir imagen a Cloudinary si existe
      if (req.files && req.files.photo_post_url && req.files.photo_post_url.length > 0) {
        try {
          const result = await cloudinary.uploader.upload(req.files.photo_post_url[0].path, {
            folder: 'posts',
            transformation: [{ width: 300, height: 300, crop: 'fill' }]
          });
          if (result && result.secure_url) {
            photo_url = result.secure_url;
          } else {
            throw new Error('Error al subir imagen de post a Cloudinary');
          }
        } catch (error) {
          console.error('Error al subir imagen de post a Cloudinary:', error);
          return res.status(500).json({ error: 'Error al subir imagen de post a Cloudinary' });
        }
      }
  
      // Crear nuevo post
      const newPost = new Post({
        type,
        body,
        location: parsedCoordinates ? { type: 'Point', coordinates: parsedCoordinates } : undefined,
        reward: reward || 0,
        owner,
        pet,
        photo_post_url: photo_url
      });
  
      const savedPost = await newPost.save();

      const profilesResponse = await axios.get('http://localhost:3010/api/v1/profiles/all');
        const profiles = profilesResponse.data;

        if (!profiles || profiles.length === 0) {
            return res.status(404).json({ error: 'No se encontraron perfiles' });
        }

        // Filtrar los perfiles para excluir al creador del foro
        const filteredProfiles = profiles.filter(profile => profile.user !== owner);

        console.log(filteredProfiles)


        // Crear notificaciones para los perfiles filtrados
        const notifications = filteredProfiles.map(profile => ({
            type: 'post',
            emiter_id: owner,  // ID del creador del foro
            receiver_id: profile._id,
            post_id: savedPost._id
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


      
      res.status(201).json({ post: savedPost, pet });
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      res.status(500).json({ error: 'Hubo un error al crear la publicación' });
    }
  };




  const getPostByUserId = async (req, res) => {
    try {
        const ownerId = req.params.id;

        // Esperar a que se encuentren los posts del propietario
        const posts = await Post.find({ owner: ownerId });

        // Enrich each post with pet data
        const enrichedPosts = await Promise.all(
            posts.map(async (post) => {
                let petData = {};
                let petPhoto = '';

                if (post.type !== 'Avistamiento') {
                    const petResponse = await fetch(`http://localhost:3010/api/v1/pets/${post.pet}`);
                    if (!petResponse.ok) {
                        throw new Error('Failed to fetch pet data');
                    }
                    petData = await petResponse.json();
                    petPhoto = petData.pet.photo_url;
                }

                return {
                    petPhoto: petPhoto,
                    ...post.toObject() // Convert each individual post to a plain object
                };
            })
        );

        // Send the enriched posts to the client
        res.json(enrichedPosts);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ha ocurrido un error al procesar la solicitud.' });
    }
};
  

// Controlador para actualizar los detalles de una publicación existente
const updatePost = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['type', 'body', 'location', 'amount_reactions', 'amount_comments', 'reward'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!post) {
            return res.status(404).send();
        }

        res.send(post);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Controlador para eliminar una publicación
const deletePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndDelete(req.params.id);

        if (!post) {
            return res.status(404).send();
        }

        res.send(post);
    } catch (error) {
        res.status(500).send(error);
    }
};


//Promesas asincronas
const getPost = async (req, res) => {
    try {
        const posts = await Post.find();

        if (!posts) {
            return res.status(404).send();
        }

        const enrichedPosts = await Promise.all(posts.map(async post => {
            // Inicializa variables para owner y pet data
            let ownerData = {};
            let petData = {};
            let petPhoto = '';

            // Fetch owner data
            const ownerResponse = await fetch(`http://localhost:3010/api/v1/profiles/${post.owner}`);
            if (!ownerResponse.ok) {
                throw new Error('Failed to fetch owner data');
            }
            ownerData = await ownerResponse.json();

            // Fetch pet data only if the post is not of type 'Avistamiento'
            if (post.type !== 'Avistamiento') {
                const petResponse = await fetch(`http://localhost:3010/api/v1/pets/${post.pet}`);
                if (!petResponse.ok) {
                    throw new Error('Failed to fetch pet data');
                }
                petData = await petResponse.json();
                petPhoto = petData.pet.photo_url;
            }

            return {
                profilePhoto: ownerData.profile.photo_profile_url,
                firstName: ownerData.user.name,
                lastName: ownerData.user.last_name,
                petPhoto: petPhoto,
                numberPhone: ownerData.profile.number_phone,
                ...post.toObject()
            };
        }));

        res.send(enrichedPosts);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
};


const getPostsAll = async (req, res) => {
    try {
      const posts = await Post.find({});
      res.send(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).send('Error fetching posts');
    }
  };

  const getPostsAllByUser = async (req, res) => {
    try {
      const ownerId = req.params.id;
      const posts = await Post.findById(ownerId);
      res.send(posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      res.status(500).send('Error fetching posts');
    }
  };



const getPostById = async (req, res) => {
    const postId = req.params.id;

    

    try {
        const post = await Post.findById(postId).populate({
            path: 'comments.commentId',
            model: 'Comment'
        });



        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        console.log(post.photo_post_url);

        const ownerResponse = await fetch(`http://localhost:3010/api/v1/profiles/${post.owner}`);
        const petResponse = await fetch(`http://localhost:3010/api/v1/pets/${post.pet}`);

        
        if(post.photo_post_url === ""){
            console.log("Esta publicacion es de tipo Adopcion o perdida")
        }else{
            console.log("Esta publicacion es de tipo Avistamiento")

        }

        const ownerData = await ownerResponse.json();
        const petData = await petResponse.json();

        const petPhoto = post.photo_post_url === "" ? petData.pet.photo_url : post.photo_post_url;

        console.log(petPhoto)

        const postDetails = {
            profilePhoto: ownerData.profile.photo_profile_url,
            firstName: ownerData.user.name,
            lastName: ownerData.user.last_name,
            petPhoto: petPhoto,
            numberPhone: ownerData.profile.number_phone,
            ...post.toObject()
        };

        res.json(postDetails);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching post' });
    }
};










module.exports = {
    createPost,
    updatePost,
    deletePost,
    getPostByUserId, 
    getPost,
    getPostById,
    getPostsAll,
    getPostsAllByUser,
};
