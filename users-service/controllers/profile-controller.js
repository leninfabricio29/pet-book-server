const cloudinary = require('../config/cloudinary');
const Profile = require('../models/profile');
const User = require('../models/users'); // Asegúrate de importar el modelo User
const axios = require('axios')

const createProfile = async (req, res) => {
    try {
        // Verificar si el usuario con el ID proporcionado existe
        const user = await User.findById(req.body.user);

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Subir la imagen de perfil a Cloudinary
        let profileImageUrl = '';
        if (req.files && req.files.photo_profile) {
            const result = await cloudinary.uploader.upload(req.files.photo_profile[0].path, {
                folder: 'profiles',
                transformation: [{ width: 300, height: 300, crop: 'fill' }]
            });
            if (result && result.secure_url) {
                profileImageUrl = result.secure_url;
                console.log('Imagen de perfil subida:', profileImageUrl);
            } else {
                console.error('Error al subir imagen de perfil a Cloudinary:', result);
                return res.status(500).send({ error: 'Error al subir imagen de perfil a Cloudinary' });
            }
        }

        // Subir la imagen de portada a Cloudinary si existe
        let coverImageUrl = '';
        if (req.files && req.files.photo_cover) {
            const result = await cloudinary.uploader.upload(req.files.photo_cover[0].path, {
                folder: 'covers',
                transformation: [{ width: 1200, height: 300, crop: 'fill' }]
            });
            if (result && result.secure_url) {
                coverImageUrl = result.secure_url;
                console.log('Imagen de portada subida:', coverImageUrl);
            } else {
                console.error('Error al subir imagen de portada a Cloudinary:', result);
                return res.status(500).send({ error: 'Error al subir imagen de portada a Cloudinary' });
            }
        }

        // Verificar si se subió la imagen de perfil antes de crear el perfil
        if (!profileImageUrl) {
            console.error('Error: La imagen de perfil no se subió correctamente');
            return res.status(400).send({ error: 'La imagen de perfil es requerida' });
        }

        // Crear el perfil con los datos proporcionados
        const profileData = {
            ...req.body,
            photo_profile_url: profileImageUrl,
            photo_cover_url: coverImageUrl
        };


        const profile = new Profile(profileData);
        user.status_profile=true;

        await user.save();

        await profile.save();


        res.status(201).send({ message: "Se ha creado un nuevo perfil para el usuario " + user.name });
    } catch (error) {
        console.error('Error al crear el perfil:', error);
        res.status(400).send({ error: 'Error al crear el perfil' });
    }
};


const getProfiles = async (req, res) => {
    try {
        // Obtener todos los perfiles
        const profiles = await Profile.find({});
        
        res.status(200).json(profiles);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching profiles' });
    
    }
}




// Controlador para obtener un perfil por su ID
const getProfileByUserId = async (req, res) => {
    try {
        // Obtener el usuario por su ID
        const user = await User.findById(req.params.id);

        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Obtener el perfil asociado al usuario
        const profile = await Profile.findOne({ user: user._id });

        // Verificar si el perfil existe
        if (!profile) {
            return res.status(404).send({ error: 'Profile not found' });
        }

        // Combinar los datos del perfil y del usuario en un solo objeto JSON
        const data = {
            profile: profile.toObject(), // Convertir el perfil a un objeto JSON
            user: user.toObject() // Convertir el usuario a un objeto JSON
        };

        // Enviar la respuesta con los datos combinados
        res.send(data);

    } catch (error) {
        res.status(500).send(error);
    }
};


const getProfileId = async (req, res) => {
    try {
      const profileId = req.params.id;
      const profile = await Profile.findById(profileId);
      
      if (!profile) {
        return res.status(404).json({ message: 'Perfil no encontrado' });
      }
      
      res.status(200).json(profile);
    } catch (error) {
      res.status(500).json({ message: 'Error del servidor', error });
    }
  };


//Controlador seguir perfile
const addFollower = async (req, res) => {
    try {
        const { profileId, followerId } = req.body;

        if (!profileId || !followerId) {
            return res.status(400).json({ message: 'Profile ID and Follower ID are required' });
        }

        // Encuentra el perfil al que se quiere agregar un seguidor
        const profile = await Profile.findById(profileId);

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Encuentra el perfil del seguidor
        const followerProfile = await Profile.findById(followerId);

        if (!followerProfile) {
            return res.status(404).json({ message: 'Follower profile not found' });
        }

        // Verifica si el seguidor ya está en la lista de seguidores
        if (profile.following.includes(followerId)) {
            return res.status(400).json({ message: 'This user is already a follower' });
        }

        // Agrega el seguidor al perfil
        profile.following.push(followerId);

        // Guarda los cambios en la base de datos
        await profile.save();

        // También agrega el perfil al que se sigue en la lista de following del seguidor
        followerProfile.followers.push(profileId);
        await followerProfile.save();

        // Encuentra el perfil actualizado con la información del usuario
        const updatedProfile = await Profile.findById(profileId).populate('user');

        res.status(200).json({ message: '!Genial!, Ahora sigues este perfil', profile: updatedProfile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



const removeFollower = async (req, res) => {
    try {
        const { profileId, followerId } = req.body;

        if (!profileId || !followerId) {
            return res.status(400).json({ message: 'Profile ID and Follower ID are required' });
        }

        // Encuentra el perfil al que se quiere dejar de seguir
        const profile = await Profile.findById(profileId);

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Encuentra el perfil del seguidor
        const followerProfile = await Profile.findById(followerId);

        if (!followerProfile) {
            return res.status(404).json({ message: 'Follower profile not found' });
        }

        // Verifica si el seguidor está en la lista de seguidores
        if (!profile.followers.includes(followerId)) {
            return res.status(400).json({ message: 'This user is not a follower' });
        }

        // Elimina el seguidor del perfil
        profile.followers = profile.followers.filter(id => id.toString() !== followerId);

        // Guarda los cambios en la base de datos
        await profile.save();

        // También elimina el perfil al que se sigue en la lista de following del seguidor
        followerProfile.following = followerProfile.following.filter(id => id.toString() !== profileId);
        await followerProfile.save();

        res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getFollowerProfile = async (req, res) => {
    try {
        const profileId = req.params.id;

        // Encuentra el perfil al que se quiere obtener los seguidores
        const profile = await Profile.findById(profileId);



        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Encuentra los perfiles de los seguidores y popula la información del usuario
        const followers = await Profile.find({ _id: { $in: profile.followers } }).populate('user');

        res.status(200).json(followers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
}

const getFollowingProfile = async (req, res) => {
    try {
        const profileId = req.params.id;

        // Encuentra el perfil al que se quiere obtener los seguidores
        const profile = await Profile.findById(profileId);


        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        // Encuentra los perfiles de los siguiendo y popula la información del usuario
        const following = await Profile.find({ _id: { $in: profile.following } }).populate('user');

        res.status(200).json(following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error });
    }
}



// Controlador para actualizar los detalles de un perfil existente
const updateProfile = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['notifications'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Actualizaciones inválidas' });
    }

    try {
        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).send({ error: 'Perfil no encontrado' });
        }

        // Actualizar solo las notificaciones en el perfil
        if (req.body.notifications && Array.isArray(req.body.notifications)) {
            profile.notifications.push(...req.body.notifications);
        }

        await profile.save();

        res.send(profile);
    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        res.status(400).send(error);
    }
};



// Controlador para eliminar un perfil
const deleteProfile = async (req, res) => {
    try {
        const profile = await Profile.findByIdAndDelete(req.params.id);

        if (!profile) {
            return res.status(404).send();
        }

        res.send(profile);
    } catch (error) {
        res.status(500).send(error);
    }
};




module.exports = {
    createProfile,
    getProfileByUserId,
    updateProfile,
    deleteProfile,
    addFollower,
    removeFollower,
    getProfileId,
    getFollowerProfile,
    getFollowingProfile,
    getProfiles
    
};
