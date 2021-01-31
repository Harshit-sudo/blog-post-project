const mongoose = require('mongoose')
const validator = require('validator')
const Article = require('./models/article')

mongoose.connect('mongodb://127.0.0.1:27017/login-passport', {
    useCreateIndex: true,
    useFindAndModify: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const User = mongoose.model('User', {
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    }, 
    password: {
        type: String,
        required: true,
        minlength: 7
    },
    blogs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        }
    ]
})

module.exports = User