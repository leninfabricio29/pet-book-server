const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Evitar que un usuario reaccione múltiples veces a la misma publicación con el mismo tipo de reacción
reactionSchema.index({ user: 1, post: 1, type: 1 }, { unique: true });

const Reaction = mongoose.model('Reaction', reactionSchema);

module.exports = Reaction;
