const mongoose = require('mongoose')

const news = new mongoose.Schema({
    title: {type: String, required: true},
    content: [{type: String, required: true}],
    author: {type: String, required: false},
    createdDate: {type: Date, default: new Date, required: true},
    points: [{type: Number, require: true, default: 0}],
    tags: [String]
})

module.exports = mongoose.model('news', news)