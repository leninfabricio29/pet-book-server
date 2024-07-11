const express = require('express');
const httpProxy = require('http-proxy');
const cors = require('cors');
const app = express();
const apiProxy = httpProxy.createProxyServer();


app.use(cors());

// Rutas para los microservicios
app.all('/api/v1/users/*', (req, res) => {
    apiProxy.web(req, res, { target: 'http://localhost:5000' });
});

app.all('/api/v1/profiles/*', (req, res) => {
    apiProxy.web(req, res, { target: 'http://localhost:5000' });
});


app.all('/api/v1/auth/*', (req, res) => {
    apiProxy.web(req, res, { target: 'http://localhost:5005' });
});

// Rutas para los microservicios en el API Gateway
app.all('/api/v1/posts/*', (req, res) => {
    apiProxy.web(req, res, { target: 'http://localhost:5020' });
});

app.all('/api/v1/events/*', (req, res) => {
    apiProxy.web(req, res, { target: 'http://localhost:5020' });
});

app.all('/api/v1/forums/*', (req, res) => {
    apiProxy.web(req, res, { target: 'http://localhost:5020' });
});
app.all('/api/v1/comments/*', (req, res) => {
    apiProxy.web(req, res, { target: 'http://localhost:5020' });
});
app.all('/api/v1/reactions/*', (req, res) => {
    apiProxy.web(req, res, { target: 'http://localhost:5020' });
});
app.all('/api/v1/notifications/*', (req, res) => {
    apiProxy.web(req, res, { target: 'http://localhost:5020' });
});


app.all('/api/v1/pets/*', (req, res) => {
    apiProxy.web(req, res, { target: 'http://localhost:5010' });
});

app.listen(3010, () => {
    console.log('API Gateway corriendo en el puerto 3010');
});
