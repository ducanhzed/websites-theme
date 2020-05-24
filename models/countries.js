const mongoose = require('mongoose')
const country = new mongoose.Schema({
    _id: {type: String, required: true},
    name: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 }
})


country.index({name: 1})
module.exports = mongoose.model('Countries', country)
