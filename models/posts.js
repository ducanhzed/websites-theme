const mongoose = require('mongoose')

const post = new mongoose.Schema({
    title: { type: String, required: true },
    content: [{ type: String, required: true }],
    author: { type: String, required: false },
    createdDate: { type: Date, default: new Date, required: true }, // XX
})

module.exports = mongoose.model('posts', post)