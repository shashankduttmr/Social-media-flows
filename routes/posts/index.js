const express = require('express')
const Router = express.Router()
const Middlewares = require('../../middlewares/isLoggedin')
const controllers = require('../../controllers/posts/index')
const Validations = require('../../validations/Validations')


Router.get('/', controllers.Home)
Router.get('/new', Middlewares.isLoggedin, controllers.New)
Router.post('/new', Middlewares.isLoggedin, Validations.PostValidate, controllers.Create)



module.exports = Router