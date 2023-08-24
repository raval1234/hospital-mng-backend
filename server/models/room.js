const mongoose = require('mongoose');

const rooms = new mongoose.Schema({
    name:{
        type:String,
        unique:true
    },
    
    availability:{
        type:Boolean,
        require:true
    }

});

module.exports = mongoose.model('room', rooms);
