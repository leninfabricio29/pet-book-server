const bcrypt = require('bcryptjs');
const axios = require('axios');
const jwt = require('jsonwebtoken')


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await axios.get(`http://localhost:5000/api/v1/users/email/${email}`);
        const user = response.data;

        if (!user) {
            return res.status(404).json({ message: 'No existe usuario registrado con este correo electrónico.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'La contraseña proporcionada es incorrecta.' });
        }

        // Si la autenticación es exitosa, genera un token JWT
        const token = jwt.sign({ userId: user._id }, 'fabricio29', { expiresIn: '1h' });

        
        res.status(200).json({ message: `¡Bienvenido, ${user.username}!`, token , user});
    } catch (error) {
        console.error('Error de conexión con el servidor:', error.message);
        res.status(500).json({ message: 'Ha ocurrido un error al iniciar sesión.' });
    }
};




// Array para almacenar tokens inválidos
let blacklistedTokens = [];

// Endpoint para hacer logout
exports.logout = (req, res) => {
    const token = req.headers.authorization;

    // Agregar el token a la lista negra
    blacklistedTokens.push(token);

    res.status(200).json({ message: 'Logout exitoso.' });
};

// Middleware para verificar la validez del token
exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization;

    // Verificar si el token está en la lista negra
    if (blacklistedTokens.includes(token)) {
        return res.status(401).json({ message: 'Token inválido.' });
    }

    

    next();
};



const twilio = require('twilio');

// Configuración de Twilio
const accountSid = 'AC5cba3e1f8308a8bad87e2504f2cbc841';
const authToken = 'a46eecc7e5941e10e46544647588e3cc';
const client = twilio(accountSid, authToken);

// Función para generar una nueva clave aleatoria
function generateRandomPassword(length = 5) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    return password;
}

exports.resetPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Buscar el usuario por correo electrónico
        const response = await axios.get(`http://localhost:5000/api/v1/users/email/${email}`);
        const user = response.data;

        if (!user) {
            return res.status(404).json({ message: 'No existe usuario registrado con este correo electrónico.' });
        }

        // Generar una nueva contraseña aleatoria
        const newPassword = generateRandomPassword(6);

        // Actualizar la contraseña del usuario en la base de datos
        await axios.post(`http://localhost:5000/api/v1/users/${user.email}/updatePassword/`, {password: newPassword});

        // Enviar el mensaje de texto con la nueva contraseña
        const phoneNumber = req.body.phone; // Asumiendo que el número de teléfono está en el campo 'phone'
        if (!phoneNumber) {
            return res.status(400).json({ message: 'El usuario no tiene un número de teléfono registrado.' });
        }

        const fullPhoneNumber = `+593${phoneNumber}`
        await client.messages.create({
            body: `Hola ${user.name}, tu nueva contraseña es: ${newPassword}. Por favor, cámbiala una vez que inicies sesión.`,
            from: '+16619274480', // Reemplaza con tu número de teléfono de Twilio
            to: fullPhoneNumber
        });
        console.log("Mesaje de texto enviado a:", fullPhoneNumber )
        res.status(200).json({ message: 'Mensaje de texto de restablecimiento de contraseña enviado con éxito.' });

    } catch (error) {
        console.error("Error al restablecer la contraseña: ", error);
        res.status(500).json({ message: 'Hubo un error al intentar restablecer la contraseña. Por favor, inténtalo de nuevo más tarde.' });
    }
};
