const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    type: {type: String,required: true,
    },
    body: {type: String,required: true,
    },
    location: {
        type: {
            type: String,required: false,default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitud, latitud]required: false
        }
    },
    amount_reactions: {type: Number,default: 0
    },
    amount_comments: {type: Number,default: 0
    },
    comments: [{
        commentId: {type: mongoose.Schema.Types.ObjectId,ref: 'Comment'
        }
    }],
    reward: {type: Number,default: 0
    },
    owner: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true
    },
    pet: {type: mongoose.Schema.Types.ObjectId,ref: 'Pet',required: false
    },
    createdAt: {type: Date,default: Date.now
    },
    photo_post_url: {type: String,required: false,
    },
});

// Índice geoespacial para la búsqueda por ubicación
postSchema.index({ location: '2dsphere' });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
