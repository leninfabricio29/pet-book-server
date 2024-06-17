// servicio-autenticacion/app.js
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth-routes');
const cors = require ('cors')

const app = express();

// Conexión a MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/bd_sesiones', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conexión exitosa a MongoDB'))
.catch(error => console.error('Error al conectar a MongoDB:', error));

app.use(express.json()); // Middleware para parsear JSON
app.use(cors())


//Rutas user
app.use('/api/v1/auth', authRoutes);

const PORT = 5005;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
