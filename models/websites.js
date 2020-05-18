
const mongoose = require('mongoose')

const website = new mongoose.Schema({
    _id: {type: String, required: true},
    name: { type: String, minlength: 6, required: true },
    images: [{ type: String, required: true }, { type: String, required: true }, { type: String, required: true }],
    author: { type: String, required: true },
    field: { type: String, required: true },
    details: { type: mongoose.Types.ObjectId, require: true },
    country: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, min: 0, required: true },
    createdDate: { type: Date, required: true, default: new Date }
})

website.index({ price: 1})
website.index({ color: 1})
website.index({ country: 1})
website.index({ price: 1, color: 1, country: 1 })
module.exports = mongoose.model('Websites', website)

