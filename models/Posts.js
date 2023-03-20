const mongoose = require('mongoose')

const {Schema} = mongoose

const cmt = require('./Comment')


const PostSchema = new Schema({
    imgs:[
        {
            url:String,
            filename:String
        }
    ],
    name:{
        type:String,
        required:[true]
    },
    location:{
        type:String,
        required:[true]
    },
    geometry:{
        type: {
            type: String, // Don't do `{ location: { type: String } }`
            enum: ['Point'], // 'location.type' must be 'Point'
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    description:{
        type:String,
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
    comments:[
        {
            type:Schema.Types.ObjectId,
            ref:'Comment'
        }
    ],
    post_visibility:{
        type:Boolean,
        default: true
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

PostSchema.post('findOneAndDelete', async function(e){
    if(e.comments.length){
        await cmt.deleteMany({_id:{$in:e.comments}})
    }
})

module.exports = mongoose.model('Post', PostSchema)