const User = require('../../models/Users')
const jwt = require('jsonwebtoken')
const AppError = require('../../err')
const cloudinary = require('cloudinary').v2
const mailer = require('../../utils/EmailHelper')
const crypto = require('crypto')

cloudinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.apikey,
    api_secret: process.env.apisecret
})


module.exports.Register = function (req, res, next) {
    res.render('users/register')
}

module.exports.RegisterUser = async function (req, res, next) {
    try {
        const { name, lastname, email, username, password } = req.body

        if (!(name && lastname && email && username && password)) {
            req.flash('error', 'All fields are required')
            res.redirect('/user/register')
        } else {
            // existing user //
            const user = await User.findOne({ username: username })
            if (user) {
                req.flash('error', 'Username is already registered')
                res.redirect('/user/register')
            } else {
                const usr = new User({
                    name: name,
                    lastname: lastname,
                    email: email,
                    username: username,
                    password: password
                })
                if (req.files) {
                    const result = await cloudinary.uploader.upload(req.files.photo.tempFilePath)
                    usr.profilepic = { url: result.secure_url, filename: result.public_id }
                }
                let token = usr.getToken()
                const decode = jwt.verify(token, process.env.token)
                await usr.save()
                req.flash('success', 'Thankyou for registering')
                res.cookie('__cu__', token, { secure: true, signed: true, httpOnly: true })
                res.cookie('_user', decode, { secure: true, signed: true, httpOnly: true })
                res.redirect('/posts')
            }
        }


    } catch (error) {
        console.log(error);
        next(new AppError('Failed to register'))
    }
}

module.exports.login = function (req, res) {
    res.render('users/login')
}

module.exports.UserLogin = async function (req, res, next) {
    try {
        const { username, password } = req.body

        if (!(username && password)) {
            req.flash('error', 'All fields are mendatory')
            res.redirect('/user/login')
        } else {
            //Checking user exists or not
            const existinguser = await User.findOne({ username: username })
            if (!existinguser) {
                req.flash('error', 'User is does not exists in database')
                res.redirect('/user/register')
            }
            const verify = await existinguser.ValidatePassword(password)
            if (!verify) {
                req.flash('error', 'Invalid username or a password')
                res.redirect('/user/login')
            } else {
                const token = existinguser.getToken()
                const decode = jwt.verify(token, process.env.token)
                res.cookie('__cu__', token, { secure: true, signed: true, httpOnly: true })
                res.cookie('_user', decode, { secure: true, signed: true, httpOnly: true })
                req.flash('success', 'Welcome back')
                res.redirect('/posts')
            }

        }
    } catch (error) {
        next(new AppError('Failed to login', 500))
    }
}

module.exports.logOut = function (req, res, next) {
    res.clearCookie('__cu__')
    res.clearCookie('_user')
    res.redirect('/posts')
}

module.exports.forgetPassword = function (req, res, next) {
    res.render('users/forgetpassword')
}

module.exports.SendForgetPasswordToken = async function (req, res, next) {
    try {
        const { username } = req.body

        if (!username) return next(new AppError('Invalid username', 404))

        const user = await User.findOne({ username: username })

        if (!user) return next(new AppError('User not found', 404))

        const token = user.getForgetPasswordToken()

        await user.save({ validateBeforeSave: true })

        const myURL = `${req.protocol}://${req.get("host")}/user/changepassword/${token}`

        const message = `Copy paste this url and hit enter ${myURL}`

        try {
            mailer({
                toMail: user.email,
                Subject: 'User Forgot password',
                message: message
            })

            res.status(200).render('users/mail', { user })
        } catch (error) {
            user.forgetPasswordExpiry = undefined
            user.forgetPasswordToken = undefined
            await user.save({ validateBeforeSave: true })
            return next(new AppError(error.message, 500))
        }

    } catch (error) {
        next(new AppError('Failed to set password', 404))
    }
}

module.exports.Verify = async function (req, res, next) {
    try {
        const { token } = req.params
        if (!token) return next(new AppError('Invalid token'))
        res.render('users/passwordchange', { token })
    } catch (error) {
        next(new AppError('Failed to set password', 404))
    }
}

module.exports.ChangePassword = async function (req, res, next) {
    try {
        const { password, confirmpassword } = req.body

        const { token } = req.params

        if (!(password && confirmpassword)) return next(new AppError('password is missing', 404))

        if (!token) return next(new AppError('token is missing', 500))

        const encryPassword = crypto.createHash('sha256').update(token).digest('hex')

        const user = await User.findOne({ forgetPasswordToken: encryPassword, forgetPasswordExpiry: { $gt: Date.now() } })

        if (!user) return next(new AppError('Failed to change user password', 500))

        if (password !== confirmpassword) return next(new AppError('Password is not matching', 500))

        user.password = password

        user.forgetPasswordExpiry = undefined
        user.forgetPasswordToken = undefined

        await user.save()

        req.flash('success', 'You have changed your password')
        res.redirect('/posts')
    } catch (error) {
        const { token } = req.params
        if (!token) {
            return next(new AppError('Failed to change user password', 500))
        }
        const encryToken = crypto.createHash('sha256').update(token).digest('hex')
        await User.findOne({ encryToken }).findOneAndUpdate({ forgetPasswordExpiry: undefined, forgetPasswordToken: undefined })
        next(new AppError('Failed to change user password', 500))

    }
}