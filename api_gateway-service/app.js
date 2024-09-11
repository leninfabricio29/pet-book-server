const express = require('express');
const httpProxy = require('http-proxy');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const app = express();
const apiProxy = httpProxy.createProxyServer();

app.use(cors());

// Configuración de rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10000 // Límite cada IP a 10000 solicitudes por ventana de tiempo
});

app.use(limiter);

// Configuración de balanceo de carga para microservicios
const services = {
    users: ['http://localhost:6010'],
    profiles: ['http://localhost:6010'],
    auth: ['http://localhost:4000', 'http://localhost:4010', 'http://localhost:4020'],
    posts: ['http://localhost:6030'],
    events: ['http://localhost:6030'],
    forums: ['http://localhost:6030'],
    comments: ['http://localhost:6030'],
    reactions: ['http://localhost:6030'],
    notifications: ['http://localhost:6030'],
    pets: ['http://localhost:6020']
};

// Índices de round-robin para los servicios
const serviceIndices = {};

const getNextServer = (service) => {
    if (!services[service]) {
        return null;
    }
    if (!serviceIndices[service]) {
        serviceIndices[service] = 0;
    }
    const servers = services[service];
    const index = serviceIndices[service];
    const nextServer = servers[index];
    serviceIndices[service] = (index + 1) % servers.length;
    return nextServer;
};

// Función para manejar las redirecciones
const handleRedirect = (service, req, res) => {
    const target = getNextServer(service);
    if (!target) {
        console.error(`Servicio no encontrado: ${service}`);
        res.status(404).json({ error: `Servicio ${service} no encontrado.` });
        return;
    }
    console.log(`Redirigiendo a servicio ${service}: ${target}`);
    apiProxy.web(req, res, { target }, (err) => {
        if (err) {
            console.error(`Error al redirigir a ${service}:`, err);
            res.status(500).json({ error: `Error al conectar con el servicio ${service}.` });
        }
    });
};

// Rutas para los microservicios
app.all('/api/v1/:service/*', (req, res) => {
    const service = req.params.service;
    handleRedirect(service, req, res);
});

// Manejo de errores general
apiProxy.on('error', (err, req, res) => {
    console.error('Error en el proxy:', err);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Algo salió mal en el API Gateway.' });
    }
});

app.listen(3010, () => {
    console.log('API Gateway corriendo en el puerto 3010');
});