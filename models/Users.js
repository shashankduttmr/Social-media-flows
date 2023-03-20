const mongoose = require('mongoose')
const {Schema} = mongoose
const bcryptjs = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')


const UserSchema = new Schema({
    profilepic:{
        url:{
            type:String
        },
        filename:{
            type:String
        }
    },
    name:{
        type:String,
        required:[true]
    },
    lastname:{
        type:String,
        required:[true]
    },
    email:{
        type:String,
        required:[true],
        unique:[true, 'email is already registered']
    },
    username:{
        type:String,
        required:[true]
    },
    password:{
        type:String,
        required:[true]
    },
    coverpic:{
        url:{
            type:String
        },
        filename:{
            type:String
        }
    },
    followers:[
        {
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    followings:[
        {
            type:Schema.Types.ObjectId,
            ref:'User'
        }
    ],
    pendingReq:[
        {
            type: Schema.Types.ObjectId,
            ref:'PendingReq'
        }
    ],
    posts:[
        {
            type:Schema.Types.ObjectId,
            ref:'Post'
        }
    ],

    isprofileLocked:{
        type:Boolean,
        default: true
    },
    forgetPasswordToken:String,
    forgetPasswordExpiry:String
})

UserSchema.pre('save', async function(next){
    if(!this.isModified('password'))return next()
    this.password = await bcryptjs.hash(this.password, 10)
})

UserSchema.methods.ValidatePassword = async function(password){
    return await bcryptjs.compare(password, this.password)
}

UserSchema.methods.getForgetPasswordToken = function(){
    const token = crypto.randomBytes(20).toString('hex')

    // getting a hash
    this.forgetPasswordToken = crypto.createHash('sha256').update(token).digest('hex')

    //time of token expiry
    this.forgetPasswordExpiry = Date.now() * 20*60 * 1000
    return token
}

UserSchema.methods.getToken = function(){
    return jwt.sign({
        CurrentUser:this._id,
        username:this.username,
        email:this.email
    },
        process.env.token,
    )
}

module.exports = mongoose.model('User', UserSchema)