const JWT = require('jsonwebtoken')
const User = require('../../models/Users')
const request = require('../../models/PendingRequests')
const AppError = require('../../err')

module.exports.AddFriend = async function(req, res, next){
    try {
        const {userid} = req.params
        const token = req.signedCookies.__cu__ || req.body || req.header('Authorization').replace('Bearer ', '')

        if(!(userid && token)) return next(new AppError('Invalid Inputs', 404))

        const decode = JWT.verify(token, process.env.token)

        const {CurrentUser, username} = decode

        if(!(CurrentUser && username)) return next(new AppError('All fields are required', 404))

        const user1 = await User.findById(userid)

        const user2 = await User.findById(CurrentUser)

        if(!(user1 && user2)) return next(new AppError('Users not found', 404))

        if(user1.isprofileLocked){
            const re = new request({
                from:user2._id
            })
            user1.pendingReq.push(re)
            await req.save()
            await user1.save()
            req.flash('success', 'Your request is sent')
            res.redirect(`/user/${user1.username}`)

        }else{
            user1.followers.push(user2)
            user2.followings.push(user1)
            await user1.save()
            await user2.save()
            req.flash('success', `You are now following ${user1.name}`)
            res.redirect(`/user/${user1.username}`)
        }

    } catch (error) {
        next(new AppError(error, 500))   
    }
}

module.exports.AcceptRequest = async function(req, res, next){
    try {
        
    } catch (error) {
        
    }
}