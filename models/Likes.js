const mongoose = require('mongoose')

const {Schema} = mongoose

const LikeSchema = new Schema({
    post:{
        type:Schema.Types.ObjectId,
        ref:'Post'
    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
})

module.exports = mongoose.model('Like', LikeSchema)