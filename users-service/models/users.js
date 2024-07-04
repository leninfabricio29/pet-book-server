const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    }
});
// Método de instancia para actualizar la contraseña
userSchema.methods.updatePassword = async function(newPassword) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(newPassword, salt);
    await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
