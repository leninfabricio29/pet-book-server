const axios = require('axios');
const cloudinary = require('../config/cloudinary');

const Pet = require('../models/pets'); // Asegúrate de que la ruta es correcta

const createPet = async (req, res) => {
    try {
        const ownerId = req.body.owner;
        // Verificar si el ownerId fue proporcionado
        if (!ownerId) {
            return res.status(400).send({ error: 'Owner ID is required' });
        }

        // Realizar una solicitud al microservicio de usuarios para verificar el usuario
        const userResponse = await axios.get(`http://localhost:5000/api/v1/users/${ownerId}`);
        
        // Verificar si el usuario existe
        if (userResponse.status !== 200 || !userResponse.data) {
            return res.status(404).send({ error: 'User not found' });
        }

        let photo_url = '';
        if (req.files && req.files.photo_profile) {
            const result = await cloudinary.uploader.upload(req.files.photo_profile[0].path, {
                folder: 'pets',
                transformation: [{ width: 300, height: 300, crop: 'fill' }]
            });
            if (result && result.secure_url) {
                photo_url = result.secure_url;
                console.log('Imagen de perfil subida:', photo_url);
            } else {
                console.error('Error al subir imagen de perfil a Cloudinary:', result);
                return res.status(500).send({ error: 'Error al subir imagen de perfil a Cloudinary' });
            }
        }

        // Verificar si se subió la imagen de perfil antes de crear el perfil
        if (!photo_url) {
            console.error('Error: La imagen de perfil no se subió correctamente');
            return res.status(400).send({ error: 'La imagen de perfil es requerida' });
        }

        // Crear los datos de la mascota incluyendo el owner
        const petData = {
            ...req.body,
            owner: ownerId,
            photo_url: photo_url,
        };

        // Crear una nueva instancia del modelo Pet
        const pet = new Pet(petData);


        // Guardar la mascota en la base de datos
        await pet.save();

        // Enviar la respuesta con la mascota creada
        res.status(201).send(pet);
    } catch (error) {
        // Manejo de errores más específico
        if (error.response && error.response.status === 404) {
            return res.status(404).send({ error: 'User not found' });
        }

        console.error(error);
        res.status(500).send({ error: 'Server error, please try again later' });
    }
};

//Controlador para obtener una nueva mascota
const getAllPets = async (req, res) => {
    try {
        const pets = await Pet.find();
        res.send(pets);
    } catch (error) {
        res.status(500).send(error);
    }
};

const getPetsByUser = async (req, res) => {
    try {
        const ownerId = req.body.owner;

        // Verificar si el ownerId fue proporcionado
        if (!ownerId) {
            return res.status(400).send({ error: 'Owner ID is required' });
        }

        // Realizar una solicitud al microservicio de usuarios para verificar el usuario
        const userResponse = await axios.get(`http://localhost:6010/api/v1/users/${ownerId}`);

        // Verificar si el usuario existe
        if (userResponse.status !== 200 || !userResponse.data) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Recuperar todas las mascotas asociadas al ownerId
        const pets = await Pet.find({ owner: ownerId });

        // Enviar las mascotas encontradas en la respuesta
        res.status(200).send(pets);
    } catch (error) {
        // Manejar posibles errores de Axios y MongoDB
        if (error.response && error.response.data) {
            return res.status(error.response.status).send({ error: error.response.data.error });
        }
        res.status(500).send({ error: 'Internal server error' });
    }
};


const changeStatusPet = async (req, res) => {
    try {
        const { petId } = req.body;
        const { status } = req.body;

        // Validar que el nuevo estado está presente en la solicitud
        if (typeof status !== 'boolean') {
            return res.status(400).json({ message: 'El nuevo estado debe ser un valor booleano.' });
        }

        // Buscar la mascota por ID y actualizar su estado
        const pet = await Pet.findByIdAndUpdate(
            petId,
            { status },
            { new: true, runValidators: true }
        );

        // Si no se encuentra la mascota, devolver un error 404
        if (!pet) {
            return res.status(404).json({ message: 'Mascota no encontrada.' });
        }

        // Devolver la mascota actualizada
        res.status(200).json(pet);
    } catch (error) {
        // Manejar errores de la base de datos u otros errores
        res.status(500).json({ message: 'Error al actualizar el estado de la mascota.', error });
    }
};



//Controlador para obtener una mascota por id
const getPetById = async (req, res) => {
    const id = req.params.id;

    try {
        const pet = await Pet.findById(id);

        if (!pet) {
            return res.status(404).send({ error: 'Pet not found' });
        }

        res.send({pet});
    } catch (error) {
        res.status(500).send(error);
    }
};




// Controlador para actualizar los detalles de una mascota existente
const updatePet = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'breed', 'sex', 'age', 'size', 'color', 'has_disease', 'requires_treatment', 'sterilization_status', 'photo', 'status'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const pet = await Pet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        if (!pet) {
            return res.status(404).send();
        }

        res.send(pet);
    } catch (error) {
        res.status(400).send(error);
    }
};

// Controlador para eliminar una mascota
const deletePet = async (req, res) => {
    try {
        const pet = await Pet.findByIdAndDelete(req.params.id);

        if (!pet) {
            return res.status(404).send();
        }

        res.send(pet);
    } catch (error) {
        res.status(500).send(error);
    }
};

module.exports = {
    createPet,
    updatePet,
    deletePet,
    getAllPets,
    getPetById,
    getPetsByUser,
    changeStatusPet,
};
