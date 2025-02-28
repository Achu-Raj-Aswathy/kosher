const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({

    roomType : {
        type : String,
        enum:['deluxe', 'twin'],
        required : true
    },
    description : {
        type : String,
        required : true 
    },
    price : {
        type : Number,
        required : true
    },
    image : {
        type : Array,
        required : true
    },
    count: {
        type: Number,
        required: true
    },
    capacity:{
        type: Number,
        required: true
    },
    
})

module.exports = mongoose.model('rooms',roomSchema)