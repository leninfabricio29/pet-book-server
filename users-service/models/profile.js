const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true
    },
    number_phone: {
        type: Number,required: true
    },
    photo_profile_url: {
        type: String,required: true
    },
    photo_cover_url: {
        type: String,required: false
    },
    word_description: {
        type: String,required: true
    },
    description: {
        type: String,required: true
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,ref: 'Profile'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,ref: 'Profile'
    }],
    notifications: [{type: mongoose.Schema.Types.ObjectId,ref: 'Notification'}]
});

profileSchema.pre('findOneAndDelete', async function(next) {
    const profile = await this.model.findOne(this.getFilter());

    // Eliminar de las listas de seguidores y seguidos de otros perfiles
    await this.model.updateMany(
        { followers: profile._id },
        { $pull: { followers: profile._id } }
    );
    await this.model.updateMany(
        { following: profile._id },
        { $pull: { following: profile._id } }
    );

    next();

});


const Profile = mongoose.model('Profile', profileSchema);
module.exports = Profile;
