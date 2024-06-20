const Forum = require('../models/forum');
const axios = require('axios');
// Crear un nuevo foro
const createForum = async (req, res) => {
    try {
        const { question, date, createdBy } = req.body;
        const newForum = new Forum({ question, date, createdBy });

       

        await newForum.save();
        res.status(201).json(newForum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Obtener todos los foros
const getForums = async (req, res) => {
    try {
        const forums = await Forum.find()
            

        res.json(forums);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los foros' });
    }
};

// Obtener un foro por ID
const getForumById = async (req, res) => {
    try {
        const forum = await Forum.findById(req.params.id).populate({
            path: 'answers.commentId',
            model: 'Comment'
        });
        
        


        if (!forum) {
            return res.status(404).json({ error: 'Foro no encontrado' });
        }
        res.status(200).json(forum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un foro
const updateForum = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        const forum = await Forum.findByIdAndUpdate(id, updatedData, { new: true });
        if (!forum) {
            return res.status(404).json({ error: 'Foro no encontrado' });
        }
        res.status(200).json(forum);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Eliminar un foro
const deleteForum = async (req, res) => {
    try {
        const { id } = req.params;
        const forum = await Forum.findByIdAndDelete(id);
        if (!forum) {
            return res.status(404).json({ error: 'Foro no encontrado' });
        }
        res.status(200).json({ message: 'Foro eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createForum,
    getForums,
    getForumById,
    updateForum,
    deleteForum
};
