const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const sinon = require('sinon');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Importar el controlador
const { login } = require('./auth-controller');

// Configurar la ruta para las pruebas
app.post('/login', login);

describe('POST /login', () => {
    let axiosGetStub;
    let bcryptCompareStub;
    let jwtSignStub;

    beforeEach(() => {
        axiosGetStub = sinon.stub(axios, 'get');
        bcryptCompareStub = sinon.stub(bcrypt, 'compare');
        jwtSignStub = sinon.stub(jwt, 'sign');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should return 200 and token on successful login', async () => {
        const mockUser = { _id: '123', password: '$2a$10$...', username: 'testuser' };

        axiosGetStub.resolves({ data: mockUser });
        bcryptCompareStub.resolves(true);
        jwtSignStub.returns('mockToken');

        const response = await request(app)
            .post('/login')
            .send({ email: 'lenfa29@unl.edu.ec', password: '123456' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('¡Bienvenido, testuser!');
        expect(response.body.token).toBe('mockToken');
    });

    it('should return 404 if user does not exist', async () => {
        axiosGetStub.resolves(null);

        const response = await request(app)
            .post('/login')
            .send({ email: 'lenfa29a@unl.edu.ec', password: '123456' });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('No existe usuario registrado con este correo electrónico.');
    });

    it('should return 401 if password is incorrect', async () => {
        const mockUser = { _id: '123', password: '$2a$10$...' };

        axiosGetStub.resolves({ data: mockUser });
        bcryptCompareStub.resolves(false);

        const response = await request(app)
            .post('/login')
            .send({ email: 'lenfa29a@unl.edu.ec', password: '12aaa3456' });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('La contraseña proporcionada es incorrecta.');
    });
});
