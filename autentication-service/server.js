// servicio-autenticacion/app.js
const express = require('express');
const authRoutes = require('./routes/auth-routes');
const cors = require ('cors')

const app = express();

// Conexión a MongoDB


app.use(express.json()); // Middleware para parsear JSON
app.use(cors())
// En cada servicio de autenticación
app.get('/healthcheck', (req, res) => {
    res.status(200).send('OK');
});



//Rutas user
app.use('/api/v1/auth', authRoutes);

const PORT = 4010;
app.listen(PORT,() => {
    console.log(`Servidor autenticación replica uno ${PORT}`);
});
