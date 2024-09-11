const User = require('../models/users');
const Profile = require('../models/profile'); // Asegúrate de importar el modelo Profile
const bcrypt = require('bcryptjs');
const axios = require('axios');

exports.getUsers = async (req, res) => {
    try {
        // Obtener todos los usuarios con sus perfiles asociados
        const usersWithProfiles = await Profile.find().populate('user');


        // Verificar si se encontraron usuarios
        if (!usersWithProfiles || usersWithProfiles.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        // Enviar la respuesta con los usuarios y sus perfiles asociados
        res.json(usersWithProfiles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getUserByEmail = async (req, res) => {
    const { email } = req.params;


    try {
        const user = await User.findOne({ email });
        if (!user) {
           return res.status(404).json({ message: "1" });
        }
        res.json(user);
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        res.status(500).json({ message: error.message });
    }
};



exports.getUserById = async (req, res) => {
    // Imprimir el contenido de req.params para verificar el ID recibido

    const { id } = req.params;

    try {
        // Imprimir el ID que se usará para la consulta

        // Buscar el usuario por su ID
        const user = await User.findById(id);

        // Imprimir el resultado de la consulta
        
        if (!user) {
            // Si no se encuentra el usuario, imprimir mensaje de error
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Enviar la respuesta con el usuario encontrado
        res.json(user);
    } catch (error) {
        // Imprimir el error si ocurre
        res.status(500).json({ message: error.message });
    }
};



exports.createUser = async (req, res) => {
    // Obtener los datos del usuario desde la solicitud
    const userData = req.body;

    const UsersCreados = User.find()


    try {
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Crear un nuevo objeto de usuario con la contraseña hasheada
        const user = new User({
            name: userData.name,
            last_name: userData.last_name,
            ci: userData.ci,
            username: userData.username,
            email: userData.email,
            password: hashedPassword, // Asignar la contraseña hasheada
            rol: userData.rol
        });

        // Guardar el usuario en la base de datos
        const newUser = await user.save();
        console.log("Estos son los usuarios que ya existen", UsersCreados)


        console.log("Nuevo suuario creado",newUser)

        // Respondemos con éxito
        res.status(201).json({ message: 'Usuario creado correctamente', user: newUser });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.ci) {
            // Si el error es por duplicación del campo CI
            res.status(400).json({ message: 'Ya existe un usuario en PetBook con ese número de identificación' });
        } else if (error.code === 11000 && error.keyPattern && error.keyPattern.email){
            res.status(400).json({ message: 'Debes usar otro correo, el que has ingresado ya está en uso' });
        } else if (error.code === 11000 && error.keyPattern && error.keyPattern.username){
            res.status(400).json({ message: 'El campo usuario que has ingresado no está disponible' });
        } else {
            // Otros errores
            res.status(400).json({ message: error.message });
        }
    }
};

exports.updatePassword = async (req, res) => {
    const { email } = req.params;

    const {password} = req.body;

    try {
        // Busca el usuario por correo electrónico
        const response = await axios.get(`http://localhost:3010/api/v1/users/email/${email}`);
        const userData = response.data;

        if (!userData) {
            return res.status(404).json({ message: 'No existe usuario registrado con este correo electrónico.' });
        }

        // Busca el usuario en la base de datos utilizando Mongoose
        const user = await User.findById(userData._id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        // Actualiza la contraseña del usuario
        await user.updatePassword(password);
        await user.save();


        res.status(200).json({ message: 'Contraseña actualizada con éxito.' });
    } catch (error) {
        console.error("Error al actualizar la contraseña: ", error);
        res.status(500).json({ message: 'Hubo un error al actualizar la contraseña. Por favor, inténtalo de nuevo más tarde.' });
    }
};


exports.updateInteraction = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Guardar la hora actual en UTC
        user.last_interaction = new Date();
        await user.save();

        res.status(200).json({ message: 'Última interacción actualizada' });
    } catch (error) {
        console.error('Error al actualizar la última interacción:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

exports.getUsersAll = async function (req, res) {
    try {
        const users = await User.find()

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching users' });
    }
}


exports.deleteUser= async function (req, res) {
    console.log('deleting user');
        try {
            const userId = req.params.id;
            await User.findByIdAndDelete(userId); 
            console.log('User deleted', userId);
            // Aquí se activan los hooks automáticamente
            res.status(200).json({ message: 'Usuario eliminado correctamente.' });
        } catch (error) {
            console.log(error);
            res.status(500).json({ message: 'Error al eliminar el usuario.', error: error });
        }
}


