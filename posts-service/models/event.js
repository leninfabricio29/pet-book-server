const mongoose = require('mongoose');
const { Schema } = mongoose;

// Definición del esquema de evento
const eventSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    users_saveds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'cancelled'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware para actualizar la fecha de actualización antes de guardar
eventSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Creación del modelo de evento
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
