const mongoose = require('mongoose')

const news = new mongoose.Schema({
    _id: { type: String, required: true }, //
    title: { type: String, required: true }, //
    content: { type: String, required: true }, //
    author: { type: String, required: false },  //
    createdDate: { type: Date, default: new Date, required: true },
    /* Số người view news, tăng thêm khi có người vào */
    points: [{ type: Number, require: true, default: 0, max: 9999 }],
    /* Thêm tùy ý, ajax tìm */
    tags: [String], //
    /* Thêm tùy ý, ko tìm ajax */
    keywords: [String], // 
    avatar: { type: String, require: true, default: '/images/news/no-image.jpg' } //
})

news.index({ '$**': "text" })
module.exports = mongoose.model('news', news)