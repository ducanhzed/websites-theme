const mongoose = require('mongoose')
const color = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    /* Number of website belong to color */
    quantity: { type: Number, required: true, default: 0 }
})

module.exports = mongoose.model('colors', color)