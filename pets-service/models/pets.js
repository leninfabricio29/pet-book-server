const mongoose = require('mongoose');
const petSchema = new mongoose.Schema({
    type: String,
    name: { type: String, required: true },
    breed: { type: String, required: true },
    sex: String,
    age: String,
    size: String,
    color: String,
    has_disease: {
         type: Boolean,default: false 
        },
    requires_treatment: { 
        type: Boolean, default: false 
    },
    sterilization_status: { 
        type: Boolean, default: true 
    },
    photo_url: {
        type: String,required: true,
    },
    status: { 
        type: Boolean, default: true 
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,ref: 'User',required: true
    }
});

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
