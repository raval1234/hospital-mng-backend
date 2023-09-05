const mongoose = require('mongoose');

const create_hospital = new mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    address:{
        type:String
    },
    call_num:{
        type:String,
        require:true,
    },
    doctorsId:[{
        type: mongoose.Types.ObjectId,
        ref: 'doctor',
    }],
});

module.exports = mongoose.model('hospital', create_hospital);
