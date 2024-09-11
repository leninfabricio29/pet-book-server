const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Profile = require('./profile')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    ci: {
        type: Number,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['admin', 'usuario', 'fundacion'],
        default: 'usuario'
    },
    status_profile: {
        type: Boolean,
        default: false
    },
    last_interaction: {
        type: Date,
        default: Date.now
    }
});

// Middleware para eliminar el perfil cuando se elimina un usuario
userSchema.pre('findOneAndDelete', async function(next) {
    const user = await this.model.findOne(this.getFilter());

    // Eliminar el perfil asociado
    await Profile.deleteOne({ user: user._id });

    next();
});

// Método de instancia para actualizar la contraseña
userSchema.methods.updatePassword = async function(newPassword) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(newPassword, salt);
    await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
