const express = require('express')
const Router = express.Router({mergeParams:true})
const controllers = require('../../controllers/posts/Home')
const Middlewares = require('../../middlewares/isLoggedin')
const Authorization = require('../../middlewares/Authorization')

Router.get('/v1', controllers.Show)

Router.get('/edit', Middlewares.isLoggedin, Authorization.PostAuthor, controllers.Update)

Router.put('/edit', Middlewares.isLoggedin, Authorization.PostAuthor, controllers.Change)

Router.delete('/delete', Middlewares.isLoggedin, Authorization.PostAuthor, controllers.Delete)

Router.post('/like', Middlewares.isLoggedin, controllers.PostLike)



module.exports = Router