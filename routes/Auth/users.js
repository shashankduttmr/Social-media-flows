const express = require('express')
const Router = express.Router({mergeParams:true})

const controllers = require('../../controllers/Auth/user')
const middleware = require('../../middlewares/isLoggedin')

Router.get('/register', middleware.logger, controllers.Register)
Router.post('/register', middleware.logger, controllers.RegisterUser)
Router.get('/login', middleware.logger, controllers.login)
Router.get('/forgetpassword', middleware.logger, controllers.forgetPassword)
Router.post('/forgetpassword', middleware.logger, controllers.SendForgetPasswordToken)
Router.get('/changepassword/:token', middleware.logger, controllers.Verify)
Router.post('/changepassword/:token', middleware.logger, controllers.ChangePassword)
Router.post('/login', middleware.logger, controllers.UserLogin)
Router.get('/logout', middleware.isLoggedin, controllers.logOut)

module.exports = Router