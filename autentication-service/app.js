// servicio-autenticacion/app.js
const express = require('express');
const authRoutes = require('./routes/auth-routes');
const cors = require ('cors')

const app = express();

// Conexión a MongoDB


app.use(express.json()); // Middleware para parsear JSON
app.use(cors())





//Rutas user
app.use('/api/v1/auth', authRoutes);

const PORT = 4000;
app.listen(PORT,() => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
