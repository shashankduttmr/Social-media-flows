const User = require('../models/Users')
const jwt = require('jsonwebtoken')
const Comment = require('../models/Comment')
const Post = require('../models/Posts')


module.exports.PostAuthor = async function (req, res, next) {
    try {
        const token = req.signedCookies.__cu__ || req.body || req.header('Authorization').replace('Bearer ', '')
        const { id } = req.params
        if (!token) {
            req.flash('error', 'You are not authorised for this action')
            res.redirect(`/post/v1/?id=${id}`)
        } else {
            const decode = jwt.verify(token, process.env.token)
            const { CurrentUser, username } = decode
            if (!(CurrentUser && username)) {
                req.flash('error', 'You are not authorised for this action')
                res.redirect(`/post/v1/?id=${id}`)
            } else {
                const user = await User.findById(CurrentUser)
                const post = await Post.findById(id)
                if (!(user && post)) {
                    req.flash('error', 'You are not authorised for this action')
                    res.redirect(`/post/v1/?id=${id}`)
                } else {
                    if (post.author.equals(user._id)) {
                        return next()
                    } else {
                        req.flash('error', 'You are not authorised for this action')
                        res.redirect(`/post/v1/?id=${id}`)
                    }
                }
            }
        }

    } catch (error) {
        const { id } = req.params
        req.flash('error', 'You are not authorised for this action')
        res.redirect(`/post/v1/?id=${id}`)
    }
}

module.exports.CommentAuthor = async function(req, res, next){
    try {
        const token = req.signedCookies.__cu__ || req.body || req.header('Authorization').replace('Bearer ', '')
        const {id, commentID} = req.params
        if(!token){
            req.flash('error', 'You are not authorised for this action')
            res.redirect(`'/posts`)
        }else{
            const decode = jwt.verify(token, process.env.token)
            const {CurrentUser, username} = decode
            if(!(CurrentUser && username)){
                req.flash('error', 'You are not authorised for this action')
                res.redirect(`/post/v1/?id=${id}`)
            }else{
                const post = await Post.findById(id)
                const user = await User.findById(CurrentUser)
                const cmt = await Comment.findById(commentID)
                if(!(post && user && cmt)){
                    req.flash('error', 'You are not authorised for this action')
                    res.redirect(`/post/v1/?id=${id}`)
                }else{
                    if(post.author.equals(user._id) || cmt.author.equals(user._id)){
                        return next()
                    }else{
                        req.flash('error', 'You are not authorised for this action')
                        res.redirect(`/post/v1/?id=${id}`)
                    }
                }
            }
        }
    } catch (error) {
        req.flash('error', 'You are not authorised for this action')
        res.redirect(`/post/v1/?id=${id}`)
    }
}