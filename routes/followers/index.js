const express = require('express')
const Router = express.Router({mergeParams:true})
const Middlewares = require('../../middlewares/isLoggedin')
const controllers = require('../../controllers/Auth/followers')


Router.post('/', Middlewares.isLoggedin, controllers.AddFriend)



module.exports = Router