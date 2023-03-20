const jwt = require('jsonwebtoken')

module.exports.isLoggedin = function (req, res, next) {
    try {
        const token = req.signedCookies.__cu__ || req.body || req.header('Authorization').replace('Bearer ', '')
        if (!token) {
            req.flash('error', 'You must be logged in to access this resource')
            res.redirect('/user/login')
        } else {
            const decode = jwt.verify(token, process.env.token)
            const { CurrentUser, username } = decode
            if (!(CurrentUser && username)) {
                req.flash('error', 'You must be logged in to access this resource')
                res.redirect('/user/login')
            }else{
                return next()
            }
        }

    } catch (error) {
        req.flash('error', 'You must be logged in to access this resource')
        res.redirect('/user/login')
    }
}

module.exports.logger = function(req, res, next){
    try {
        const token = req.signedCookies.__cu__ || req.body || req.header('Authorization').replace('Bearer ', '')
        if(!token){
            return next()
        }else{
            const decode = jwt.verify(token, process.env.token)
            const {CurrentUser, username} = decode
            if(!(CurrentUser && username)){
                return next()
            }else{
                res.redirect('/posts')
            }
        }
    } catch (error) {
        return next()
    }
}