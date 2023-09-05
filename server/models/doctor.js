const mongoose = require('mongoose');

const create_doctors = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    call_num:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique: true
    },
    gender:{
        type:String,
        require:true
    },
    hospitalId:{
        type: mongoose.Types.ObjectId,
        ref: 'hospital',
    },
});


module.exports = mongoose.model('doctor', create_doctors)