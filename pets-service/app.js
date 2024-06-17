// servicio-pets/app.js
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const express = require('express');
const mongoose = require('mongoose');
const petRoutes = require('./routes/route-pets');
const cors = require('cors');

const app = express();

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bd_pets', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conexión exitosa a MongoDB'))
.catch(error => console.error('Error al conectar a MongoDB:', error));

app.use(express.json()); // Middleware para parsear JSON
app.use(cors()); // Conexión

//Rutas pets
app.use('/api/v1/pets', petRoutes);

const PORT = 5010;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
