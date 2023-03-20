const mongoose = require('mongoose')

const {Schema} = mongoose

const PendingReq = new Schema({
    from:{
        type:Schema.Types.ObjectId,
        ref:'User'
    }
})

module.exports = mongoose.model('PendingReq', PendingReq)