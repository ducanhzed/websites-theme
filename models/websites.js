
const mongoose = require('mongoose')

const website = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, minlength: 6, required: true },
    images: {
        type: [{ type: String, required: true }],
        validate: [(val) => val.length === 3, 'images need an array with length of 3']
    },
    author: { type: String, required: true },
    field: { type: String, required: true },
    details: { type: mongoose.Types.ObjectId, require: true }, // post model
    country: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, min: 0, required: true },
    createdDate: { type: Date, required: true, default: new Date }, // XX
    /* Số col của website */
    numOfCols: { type: Number, required: true, default: 12 },
    trend: { type: String, required: true }
})

website.index({ price: 1 })
website.index({ color: 1 })
website.index({ country: 1 })
website.index({ price: 1, color: 1, country: 1, trend: 1, numOfCols: 1 })
website.index({ numOfCols: 1 })
website.index({ trend: 1 })
module.exports = mongoose.model('Websites', website)

