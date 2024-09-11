// servicio-usuario/app.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/route-post');
const eventRoutes = require('./routes/route-events');
const forumRoutes = require('./routes/route-forums');
const commentRoutes = require('./routes/route-coments'); // Corregido typo: de 'route-coments' a 'route-comments'
const reactionRoutes = require('./routes/route-reactions');
const notificationRoutes = require('./routes/route-notifications');


const cors = require('cors');

const app = express();

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conexión exitosa a MongoDB'))
.catch(error => console.error('Error al conectar a MongoDB:', error));

app.use(express.json()); // Middleware para parsear JSON
app.use(cors()); // Conexión

// Rutas
app.use('/api/v1/posts', userRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/forums', forumRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/reactions', reactionRoutes);
app.use('/api/v1/notifications', notificationRoutes);

const PORT = 6030;
app.listen(PORT,() => {
    console.log(`Servidor POSTS / EVENTOS / FOROS corriendo en el puerto ${PORT}`);
});
