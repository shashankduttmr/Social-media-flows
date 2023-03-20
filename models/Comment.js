const mongoose = require('mongoose')

const {Schema} = mongoose

const CommentSchema = new Schema({
    rating:{
        type:Number,
        min:[1],
        max:[5],
        required:[true, 'Rating is required']
    },
    body:{
        type: String,
        required:[true, 'Comment body is required']
    },
    likes:[
        {
            type:Schema.Types.ObjectId,
            ref:'Like'
        }
    ],
    likecount:{
        type:Number,
        default:0
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
})

module.exports = mongoose.model('Comment', CommentSchema)