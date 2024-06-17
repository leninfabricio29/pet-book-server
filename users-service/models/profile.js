const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    number_phone: {
        type: Number,
        required: true
    },

    photo_profile_url: {
        type: String,
        required: true
    },

    photo_cover_url: {
        type: String,
        required: false
    },

    word_description: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    }],

    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
    }]
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
