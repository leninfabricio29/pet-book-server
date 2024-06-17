const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
    },
    body: {
        type: String,
        required: true,
    },
    location: {
        type: {
            type: String,
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitud, latitud]
            required: true
        }
    },
    amount_reactions: {
        type: Number,
        default: 0
    },
    amount_comments: {
        type: Number,
        default: 0
    },
    reward: {
        type: Number,
        default: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    }
});

// Índice geoespacial para la búsqueda por ubicación
postSchema.index({ location: '2dsphere' });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
