const mongoose = require('mongoose');
const { Schema } = mongoose;

// Definición del esquema de comentario
const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    forum: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Forum',
        required: false
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: false
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
commentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Creación del modelo de comentario
const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
