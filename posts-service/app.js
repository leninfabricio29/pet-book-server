// servicio-usuario/app.js

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/route-post');
const eventRoutes = require('./routes/route-events')
const cors = require('cors');

const app = express();

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bd_posts', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conexión exitosa a MongoDB'))
.catch(error => console.error('Error al conectar a MongoDB:', error));

app.use(express.json()); // Middleware para parsear JSON
app.use(cors()); // Conexión

//Rutas user
app.use('/api/v1/posts', userRoutes);
app.use('/api/v1/events', eventRoutes);


const PORT = 5020;
app.listen(PORT, () => {
    console.log(`Servidor POSTS / EVENTOS corriendo en el puerto ${PORT}`);
});
