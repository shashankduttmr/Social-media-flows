const Post = require('../../models/Posts')
const AppError = require('../../err')
const User = require('../../models/Users')
const jwt = require('jsonwebtoken')
const MapBox = require('@mapbox/mapbox-sdk/services/geocoding')
const Client = MapBox({ accessToken: process.env.mapbox })
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.apikey,
    api_secret: process.env.apisecret
})

module.exports.Home = async function (req, res, next) {
    try {
        const data = await Post.find({})
        if (!data) return next(new AppError('Failed to fetch data', 500))
        return res.status(200).render('posts/index', { data })
    } catch (error) {
        return next(new AppError('Something went wrong', 500))
    }
}

module.exports.New = function (req, res, next) {
    res.render('posts/new')
}

module.exports.Create = async function (req, res, next) {
    try {
        let ImgArray = new Array()
        const token = req.signedCookies.__cu__ || req.body || req.header('Authorization').replace('Bearer ', '')
        if (!token) return next(new AppError('Token is missing', 500))
        const decode = jwt.verify(token, process.env.token)
        const { CurrentUser, username } = decode

        if (!(CurrentUser && username)) return next(new AppError('Invalid details', 500))

        const user = await User.findById(CurrentUser)

        if (!user) return next(new AppError('User not found', 404))

        const data = await Client.forwardGeocode({
            query: req.body.name + ', ' + req.body.locations,
            limit: 1
        }).send()

        const post = new Post(req.body)
        post.author = user
        post.geometry = data.body.features[0].geometry
        user.posts.push(post)
        if (req.files) {
            if(req.files.imgs.length > 1){
                for (let x = 0; x < req.files.imgs.length; x++) {
                    const result = await cloudinary.uploader.upload(req.files.imgs[x].tempFilePath)
                    ImgArray.push({ url: result.secure_url, filename: result.public_id })
                }
                post.imgs = ImgArray
            }else{
                let result = await cloudinary.uploader.upload(req.files.imgs.tempFilePath)
                post.imgs.push({url:result.secure_url, filename:result.public_id})
            }
        }
        await post.save()
        await user.save()
        req.flash('success', 'you have added a post')
        res.redirect('/posts')
    } catch (error) {
        console.log(error);
        return next(new AppError('Something went wrong', 500))
    }
}