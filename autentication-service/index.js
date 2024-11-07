// servicio-autenticacion/app.js
const express = require('express');
const authRoutes = require('./routes/auth-routes');
const cors = require ('cors')

const app = express();



app.use(express.json()); // Middleware para parsear JSON
app.use(cors())



//Rutas user
app.use('/api/v1/auth', authRoutes);

const PORT = 4020;
app.listen(PORT,() => {
    console.log(`Servidor autenticación replica dos ${PORT}`);
});
