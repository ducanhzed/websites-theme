const express = require('express')

const dotenv = require('dotenv');
const mongoose = require('mongoose')
const News = require('../models/news')
const Websites = require('../models/websites')

const mongooseConnecting = require('../services/mongooseConnecting')
const router = express.Router();
dotenv.config();

router.get('/', async function (req, res, next) {
    let userAgent = req.headers['user-agent'];
    console.log(userAgent)
    res.status(200).send({ msg: 'success' })
})

router.get('/count-websites', async function (req, res, next) {
    await mongooseConnecting()
    res.json({'response': await Websites.countDocuments()});
    mongoose.connection.close();
})
module.exports = router