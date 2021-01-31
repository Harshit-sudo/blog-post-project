const mongoose = require('mongoose')
const Article = require('./article')
const User = require('../mongoose')

const commentSchema = new mongoose.Schema({
    comment: {
        type: String,
        default: ""
    },
    person: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    blog: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article'
    }
})


module.exports = mongoose.model('Comment', commentSchema)