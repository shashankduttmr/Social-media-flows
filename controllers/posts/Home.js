const AppError = require('../../err')
const Post = require('../../models/Posts')
const Like = require('../../models/Likes')
const cloudinary = require('cloudinary').v2
const User = require('../../models/Users')
const jwt = require('jsonwebtoken')

cloudinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.apikey,
    api_secret: process.env.apisecret
})

module.exports.Show = async function (req, res, next) {
    const { id } = req.query

    if (!id) return next(new AppError('Invalid Query', 404))

    const data = await Post.findById(id).populate('author').populate({
        path: 'comments',
        populate: {
            path: 'author'
        }
    }).populate('likes')


    if (!data) return next(new AppError('Post not found', 404))

    return res.status(200).render('posts/show', { data })
}

module.exports.Delete = async function (req, res) {

    const token = req.signedCookies.__cu__ || req.body || req.header('Authorization').replace('Bearer ', '')

    if (!token) return next(new AppError('Invalid token', 500))

    const { id } = req.params

    if (!id) return next(new AppError('Invalid parameters', 404))

    const data = await Post.findById(id)

    if (!data) return next(new AppError('Post not found', 404))

    const decode = jwt.verify(token, process.env.token)

    const { CurrentUser, username } = decode

    if (!(CurrentUser && username)) return next(new AppError('Invalid information', 500))

    const user = await User.findById(CurrentUser)

    if (!user) return next(new AppError('User not found', 404))

    if (data.imgs) {
        for (let x = 0; x < data.imgs.length; x++) {
            await cloudinary.uploader.destroy(data.imgs[x].filename)
        }
    }
    await Post.findByIdAndDelete(id)
    await User.findByIdAndUpdate(CurrentUser, { $pull: { posts: id } })

    req.flash('success', 'You have deleted your post')
    res.redirect('/posts')
}

module.exports.Update = async function (req, res) {
    const { id } = req.params

    if (!id) return next(new AppError('Query is missing'))

    const data = await Post.findById(id)

    if (!data) return next(new AppError('Post is not available'))

    return res.status(200).render('posts/edit', { data })
}

module.exports.Change = async function (req, res, next) {
    try {
        const { id } = req.params
        console.log(req.files);
        //extracting ID from Params
        if (!id) return next(new AppError('Invalid Parameters', 404))

        //retriving data from dbs

        const data = await Post.findById(id)

        // Checking availablity for post

        if (!data) return next(new AppError('Data Not found', 404))



        console.log(req.body);
        if (req.body.deleteImages) {
            for (let x = 0; x < req.body.deleteImages.length; x++) {
                await cloudinary.uploader.destroy(req.body.deleteImages[x])
            }
            await data.updateOne({ $pull: { imgs: { filename: { $in: req.body.deleteImages } } } })
        }

        let imgArray = new Array()
        let imgs = []
        if (req.files) {
            //adding multiple Photos//
            if (req.files.imgs.length > 1) {
                for (let x = 0; x < req.files.imgs.length; x++) {
                    let result = await cloudinary.uploader.upload(req.files.imgs[x].tempFilePath)
                    imgArray.push({ url: result.secure_url, filename: result.public_id })
                }
                let vals = imgArray.map(e => ({ url: e.url, filename: e.filename }))
                data.imgs.push(...vals)
                await data.save()

            } else {
                //Single files
                let result = await cloudinary.uploader.upload(req.files.imgs.tempFilePath)
                imgs.push({ url: result.secure_url, filename: result.public_id })
                let vals = imgs.map(e => ({ url: e.url, filename: e.filename }))
                data.imgs.push(...vals)
                await data.save()
            }

        }

        await Post.findByIdAndUpdate(id, req.body, { runValidators: true })
        req.flash('success', 'You Have updated a Post')
        res.redirect(`/post/v1/?id=${id}`)

    } catch (error) {
        console.log(error);
        next(new AppError('Failed to upload', 500))
    }
}

module.exports.PostLike = async function (req, res, next) {
    try {
        const token = req.signedCookies.__cu__ || req.body || req.header('Authorization').replace('Bearer ', '')

        if (!token) return next(new AppError('Failed to like the Post', 500))

        const { id } = req.params

        const data = await Post.findById(id)

        if (!data) return next(new AppError('Post is not available', 404))

        const decode = jwt.verify(token, process.env.token)

        const { CurrentUser, username } = decode

        const user = await User.findById(CurrentUser)

        if(!user)return next(new AppError('Failed to update like', 404))

        const likes = new Like({
            post:data,
            user:user
        })

        data.likes.push(likes)
        data.likecount = data.likes.length
        await data.save()
        likes.save()
        req.flash('success', 'You liked a post')
        res.redirect(`/post/v1/?id=${id}`)
    } catch (error) {
        next(new AppError(error, 500))
    }
}