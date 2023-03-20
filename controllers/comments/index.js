const jwt = require('jsonwebtoken')
const AppError = require('../../err')
const Comment = require('../../models/Comment')
const User = require('../../models/Users')
const Post = require('../../models/Posts')

module.exports.AddComment = async function (req, res, next) {
    try {
        const {id} = req.query

        const token = req.signedCookies.__cu__ || req.body || req.header('Authorization').replace('Bearer ', '')

        if (!token) return next(new AppError('Token is missing', 404))

        if(!id) return next(new AppError('Invalid query', 404))

        const post = await Post.findById(id)

        if(!post)return next(new AppError('Post not found', 404))

        const decode = jwt.verify(token, process.env.token)

        const { CurrentUser, username } = decode

        if(!(CurrentUser && username)) return next(new AppError('Invalid details', 400))

        const user = await User.findById(CurrentUser)

        if(!user)  return next(new AppError('User is not found', 400))

        const cmt = new Comment(req.body)

        cmt.author = user

        post.comments.push(cmt)

        await cmt.save()
        await post.save()

        req.flash('success', 'Comment Posted')
        res.redirect(`/post/v1/?id=${id}`)


    } catch (error) {
        console.log(error);
        next(new AppError('Failed to add a comment to the post', 500))
    }
}

module.exports.DeleteComments = async function(req, res, next){
    try {
        const {id, commentID} = req.params
        if(!(id && commentID))return next(new AppError('Invalid Params', 404))

        const post = await Post.findById(id)
        const cmt = await Comment.findById(commentID)
        if(!(post && cmt))return next(new AppError('Post not found', 404))

        await Comment.findByIdAndDelete(commentID)

        await Post.findByIdAndUpdate(id, {$pull:{comments:commentID}})

        req.flash('success', 'Your Comment is deleted')
        res.redirect(`/post/v1/?id=${id}`)

    } catch (error) {
        return next(new AppError('Failed to delete comment', 500))
    }
}