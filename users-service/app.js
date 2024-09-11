// servicio-usuario/app.js
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const userRoutes = require('./routes/user-routes');
const profileRoutes = require('./routes/profile-routes')


const app = express();

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex:true
    // Otras opciones de configuración aquí si es necesario
})
.then(() => console.log('Conexión exitosa a MongoDB'))
.catch(error => console.error('Error al conectar a MongoDB:', error));

app.use(express.json()); // Middleware para parsear JSON
app.use(cors())

//Rutas user
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/profiles', profileRoutes);


const PORT = 6010;
app.listen(PORT, () => {
    console.log(`Servidor microservicio Usuarios/perfiles corriendo en el puerto ${PORT}`);
});
