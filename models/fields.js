const mongoose = require('mongoose')
const fields = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 }
})

module.exports = mongoose.model('fields', fields)