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
    profiles: ['http://localhost:6010'],  // Única instancia
    auth: ['http://localhost:6000'],   // Única instancia
    posts: ['http://localhost:6030'],  // Única instancia
    events: ['http://localhost:6030'], // Única instancia
    forums: ['http://localhost:6030'], // Única instancia
    comments: ['http://localhost:6030'], // Única instancia
    reactions: ['http://localhost:6030'], // Única instancia
    notifications: ['http://localhost:6030'], // Única instancia
    pets: ['http://localhost:6020']  // Única instancia
};

const getNextServer = (service) => {
    return services[service][0];
};

// Rutas para los microservicios
app.all('/api/v1/users/*', (req, res) => {
    apiProxy.web(req, res, { target: getNextServer('users') });
});

app.all('/api/v1/profiles/*', (req, res) => {
    apiProxy.web(req, res, { target: getNextServer('profiles') });
});

app.all('/api/v1/auth/*', (req, res) => {
    apiProxy.web(req, res, { target: getNextServer('auth') });
});

// Rutas para los microservicios en el API Gateway
app.all('/api/v1/posts/*', (req, res) => {
    apiProxy.web(req, res, { target: getNextServer('posts') });
});

app.all('/api/v1/events/*', (req, res) => {
    apiProxy.web(req, res, { target: getNextServer('events') });
});

app.all('/api/v1/forums/*', (req, res) => {
    apiProxy.web(req, res, { target: getNextServer('forums') });
});

app.all('/api/v1/comments/*', (req, res) => {
    apiProxy.web(req, res, { target: getNextServer('comments') });
});

app.all('/api/v1/reactions/*', (req, res) => {
    apiProxy.web(req, res, { target: getNextServer('reactions') });
});

app.all('/api/v1/notifications/*', (req, res) => {
    apiProxy.web(req, res, { target: getNextServer('notifications') });
});

app.all('/api/v1/pets/*', (req, res) => {
    apiProxy.web(req, res, { target: getNextServer('pets') });
});

// Manejo de errores
apiProxy.on('error', (err, req, res) => {
    console.error('Error en el proxy:', err);
    res.status(500).json({ error: 'Algo salió mal en el API Gateway.' });
});

app.listen(3010, () => {
    console.log('API Gateway corriendo en el puerto 3010');
});
