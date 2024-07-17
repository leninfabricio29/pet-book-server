const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Crear un modelo de User simulado
const User = mongoose.model('User', new Schema({
    name: String,
    last_name: String,
    ci: String,
    username: String,
    email: String,
    password: String,
    rol: String
}));

// Importar el controlador
const { createUser } = require('./user-controller');

// Configurar la aplicación Express para pruebas
const app = express();
app.use(bodyParser.json());
app.post('/createUser', createUser);

describe('POST /createUser', () => {
    let bcryptHashStub;
    let userSaveStub;

    beforeEach(() => {
        bcryptHashStub = sinon.stub(bcrypt, 'hash');
        userSaveStub = sinon.stub(User.prototype, 'save');
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should create a new user and return 201 on successful creation', async () => {
        bcryptHashStub.resolves('hashedPassword');

        const mockUser = {
            name: 'John',
            last_name: 'Doe',
            ci: '123456789',
            username: 'johndoe',
            email: 'johndoe@example.com',
            password: 'password123',
            rol: 'user'
        };

        userSaveStub.resolves(mockUser);

        const response = await request(app)
            .post('/createUser')
            .send(mockUser);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('Usuario creado correctamente');
        expect(response.body.user).toEqual(mockUser);
    });

    it('should return 400 if CI is duplicate', async () => {
        bcryptHashStub.resolves('hashedPassword');

        const error = new Error('Duplicate key error collection: users index: ci_1 dup key: { ci: "123456789" }');
        error.code = 11000;
        error.keyPattern = { ci: 1 };
        userSaveStub.rejects(error);

        const mockUser = {
            name: 'John',
            last_name: 'Doe',
            ci: '123456789',
            username: 'johndoe',
            email: 'johndoe@example.com',
            password: 'password123',
            rol: 'user'
        };

        const response = await request(app)
            .post('/createUser')
            .send(mockUser);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Ya existe un usuario en PetBook con ese número de identificación');
    });

    it('should return 400 if email is duplicate', async () => {
        bcryptHashStub.resolves('hashedPassword');

        const error = new Error('Duplicate key error collection: users index: email_1 dup key: { email: "johndoe@example.com" }');
        error.code = 11000;
        error.keyPattern = { email: 1 };
        userSaveStub.rejects(error);

        const mockUser = {
            name: 'John',
            last_name: 'Doe',
            ci: '123456789',
            username: 'johndoe',
            email: 'johndoe@example.com',
            password: 'password123',
            rol: 'user'
        };

        const response = await request(app)
            .post('/createUser')
            .send(mockUser);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Debes usar otro correo, el que has ingresado ya está en uso');
    });

    it('should return 400 if username is duplicate', async () => {
        bcryptHashStub.resolves('hashedPassword');

        const error = new Error('Duplicate key error collection: users index: username_1 dup key: { username: "johndoe" }');
        error.code = 11000;
        error.keyPattern = { username: 1 };
        userSaveStub.rejects(error);

        const mockUser = {
            name: 'John',
            last_name: 'Doe',
            ci: '123456789',
            username: 'johndoe',
            email: 'johndoe@example.com',
            password: 'password123',
            rol: 'user'
        };

        const response = await request(app)
            .post('/createUser')
            .send(mockUser);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('El campo usuario que has ingresado no está disponible');
    });

    it('should return 400 on other errors', async () => {
        bcryptHashStub.resolves('hashedPassword');

        const error = new Error('Other error');
        error.code = 12345; // No es un código de error esperado
        userSaveStub.rejects(error);

        const mockUser = {
            name: 'John',
            last_name: 'Doe',
            ci: '123456789',
            username: 'johndoe',
            email: 'johndoe@example.com',
            password: 'password123',
            rol: 'user'
        };

        const response = await request(app)
            .post('/createUser')
            .send(mockUser);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Other error');
    });
});
