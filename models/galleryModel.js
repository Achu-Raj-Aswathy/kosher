const mongoose = require('mongoose')

const gallerySchema = mongoose.Schema({
    image : {
        type : String,
        required : true
    }
})

module.exports = mongoose.model('galleries',gallerySchema)