const joi = require('joi')
const AppError = require('../err')

const PostSchema = joi.object({
    name:joi.string().required(),
    location:joi.string().required(),
    description:joi.string().required(),
    deleteImages:joi.array()
}).required()


const CommentSchema = joi.object({
    rating:joi.number().min(1).max(5).required(),
    body:joi.string().required()
})


module.exports.PostValidate = function(req, res, next){

    const data = PostSchema.validate(req.body)

    if(data.error)return next(new AppError(data.error.message, 500))

    return next()
}

module.exports.CommentValidate = function(req, res, next){

    const data = CommentSchema.validate(req.body)

    if(data.error)return next(new AppError(data.error.message, 500))
    
    return next()
}