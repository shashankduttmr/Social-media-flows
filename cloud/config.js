const mongoose = require('mongoose')

function Connect(){
    mongoose.set('strictQuery', true)
    mongoose.connect(process.env.dburl)
        .then(function(){
            console.log('Connected to Database');
        })
        .catch(function(){
            console.log('Connection failed');
            process.exit(0)
        })
}


module.exports.Connect = Connect