require('dotenv').config()
require('./cloud/config').Connect()
const express = require('express')
const MethodOverride = require('method-override')
const morgan = require('morgan')
const CookieParser = require('cookie-parser')
const expressFileUpload = require('express-fileupload')
const ExpressSession = require('express-session')
const expressMongoSanitize = require('express-mongo-sanitize')
const flash = require('connect-flash')
const EjsMate = require('ejs-mate')
const connectMongo = require('connect-mongo')
const path = require('path')
const AppError = require('./err')
const app = express()
const IndexRoute = require('./routes/index')
const AuthRoute = require('./routes/Auth/users')
const PostRoute = require('./routes/posts/index')
const MorePostRoute = require('./routes/posts/Home')
const CommentRoute = require('./routes/comments/index')
const Followers = require("./routes/followers/index")

app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, '/assets')))
app.use(MethodOverride('_method'))
app.use(morgan('dev'))
app.use(expressFileUpload({
    useTempFiles:true,
    tempFileDir:'./uploader',
}))
app.use(CookieParser(process.env.cookie_secret))
app.use(expressMongoSanitize({
    replaceWith:'_'
}))
app.use(ExpressSession({
    name:'social',
    secret:'this is a secret',
    resave:false,
    saveUninitialized:true,
    store:connectMongo.create({
        dbName:'socialsession',
        mongoUrl:process.env.dburl
    })
}))
app.engine('ejs', EjsMate)
app.use(flash())
app.set('view engine', 'ejs')
app.set('/views', path.join(__dirname, '/views'))

// Middlewares
app.use(function(req, res, next){
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    if(req.signedCookies.__cu__){
        if(req.signedCookies._user){
            res.locals.currentUser = req.signedCookies._user.CurrentUser
            res.locals.username = req.signedCookies._user.username
        }else{
            res.clearCookie('__cu__')
            res.locals.currentUser = ''
            res.locals.username = ''
        }
    }else{
        res.clearCookie('_user')
        res.locals.currentUser = ''
        res.locals.username = ''
    }
    next()
})


// API Routes//
app.use('/', IndexRoute)
app.use('/user', AuthRoute)
app.use('/posts', PostRoute)
app.use('/post', PostRoute)
app.use('/post', MorePostRoute)
app.use('/post',CommentRoute)
app.use('/post/:id', MorePostRoute)
app.use('/post/:id/comment/:commentID', CommentRoute)
// app.use('/user/:userid/friend')


app.use('*', function(req, res, next){
    next(new AppError('Page not found', 404))
})



//Error handlers
app.use(function(err, req, res, next){
    const {message, status=400} = err
    res.status(status).render('error', {message, status})
})

app.listen(process.env.PORT, function(){
    console.log('Server is up');
})
