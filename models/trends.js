const mongoose = require('mongoose')
const trends = new mongoose.Schema({
    _id: {type: String, required: true},
    name: { type: String, required: true },
    /* Number of website belong to trend */
    quantity: { type: Number, required: true, default: 0, min: 0 }
})

module.exports = mongoose.model('trends', trends)