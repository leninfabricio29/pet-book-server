
const mongoose = require('mongo');

const breedSchema = new Schema({
    name : {String,
    required : true,
    },
    type:{
        type : String,
        required : true,
        enum : ['dog', 'cat', 'bird', 'otro']
    },
    
});
