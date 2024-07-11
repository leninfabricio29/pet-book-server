const Post = require('../models/post');

// Controlador para crear una nueva publicación
// Controlador de la API
const createPost = async (req, res) => {
    const { type, body, coordinates, reward, owner, pet } = req.body; // Cambiar 'pet' a 'idPet'

    try {
        const newPost = new Post({
            type,
            body,
            location: {
                type: 'Point',
                coordinates
            },
            reward,
            owner,
            pet // Usar idPet en lugar de pet
        });

        const savedPost = await newPost.save();
        
        // Enviar respuesta con el objeto y el idPet
        res.status(201).json({ post: savedPost, pet });
        console.log("Publicación creada correctamente", pet);
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
    
            // Obtener la mascota del propietario
            const petResponse = await fetch(`http://localhost:3010/api/v1/pets/${posts.pet}`);
            const petData = await petResponse.json();
    
            // Construir el objeto de respuesta con los posts y la mascota
            const responseData = {
                posts: posts,
                pet: petData
            };
    
            // Enviar el objeto de respuesta como JSON
            res.status(200).json(responseData);
    
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
            const ownerResponse = await fetch(`http://localhost:3010/api/v1/profiles/${post.owner}`);
            const petResponse = await fetch(`http://localhost:3010/api/v1/pets/${post.pet}`);

            if (!ownerResponse.ok || !petResponse.ok) {
                throw new Error('Failed to fetch owner or pet data');
            }

            const ownerData = await ownerResponse.json();
            const petData = await petResponse.json();


            return {
                profilePhoto: ownerData.profile.photo_profile_url,
                firstName: ownerData.user.name,
                lastName: ownerData.user.last_name,
                petPhoto: petData.pet.photo_url,
                numberPhone: ownerData.profile.number_phone,
                ...post.toObject()
            };
        }));

        res.send(enrichedPosts);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching posts' });
    }
}


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

        const ownerResponse = await fetch(`http://localhost:3010/api/v1/profiles/${post.owner}`);
        const petResponse = await fetch(`http://localhost:3010/api/v1/pets/${post.pet}`);

        if (!ownerResponse.ok || !petResponse.ok) {
            throw new Error('Failed to fetch owner or pet data');
        }

        const ownerData = await ownerResponse.json();
        const petData = await petResponse.json();

        const postDetails = {
            profilePhoto: ownerData.profile.photo_profile_url,
            firstName: ownerData.user.name,
            lastName: ownerData.user.last_name,
            petPhoto: petData.pet.photo_url,
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
};
