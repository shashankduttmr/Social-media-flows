const express = require('express')
const Router = express.Router({mergeParams:true})
const Controllers = require('../../controllers/comments/index')
const Middlewares = require('../../middlewares/isLoggedin')
const Authorization = require('../../middlewares/Authorization')


Router.post('/', Middlewares.isLoggedin, Controllers.AddComment)

Router.delete('/delete', Middlewares.isLoggedin, Authorization.CommentAuthor, Controllers.DeleteComments)

module.exports = Router