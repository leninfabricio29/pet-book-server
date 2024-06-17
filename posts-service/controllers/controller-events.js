const Event = require('../models/event');
const axios = require('axios');

// Controlador para crear un nuevo evento
const createEvent = async (req, res) => {
    const { title, description, date, location, userId } = req.body;

    try {
        // Verificar si el usuario existe en el servicio de usuarios
        const userResponse = await axios.get(`http://localhost:5000/api/v1/users/${userId}`);
        if (!userResponse.data) {
            return res.status(404).send({ error: 'Usuario no encontrado' });
        }

        //
        const event = new Event({
            title,
            description,
            date,
            location,
            createdBy: userId,
            users_saveds: []
        });

        await event.save();

        res.status(201).send(event);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
};



const getEvents = async (req, res) => {
    try {
        // Obtener todos los eventos
        const events = await Event.find({});
        
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const saveEvents = async (req, res) => {
    const userId = req.body.userId; // Se asume que el ID del usuario viene en el cuerpo de la solicitud
    const eventId = req.body.eventId; // Se obtiene el ID del evento de los parámetros de la solicitud

    console.log(userId, eventId);

    try {
        // Buscar el evento por ID
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        // Verificar si el usuario ya ha guardado el evento
        if (event.users_saveds.includes(userId)) {
            return res.status(400).json({ message: 'El usuario ya ha guardado este evento' });
        }

        // Agregar el ID del usuario al arreglo users_saveds
        event.users_saveds.push(userId);

        // Guardar el evento actualizado en la base de datos
        await event.save();

        return res.status(200).json({ message: 'Evento guardado con éxito', event });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al guardar el evento' });
    }
};


const getEventsByUserId = async (req, res) => {

    const userId = req.params.id;

    

    try {
        const events = await Event.find({ users_saveds: userId });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

};



module.exports = {
    createEvent,
    getEvents,
    saveEvents,
    getEventsByUserId,
};
