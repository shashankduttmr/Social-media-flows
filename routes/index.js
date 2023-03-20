const express = require('express')
const Router = express.Router()
const controllers = require('../controllers/index')

Router.get('/', controllers.Index)

module.exports = Router