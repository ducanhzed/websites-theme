const express = require('express')

const dotenv = require('dotenv');
const mongoose = require('mongoose')
const News = require('../models/news')
const Websites = require('../models/websites')

const mongooseConnecting = require('../services/mongooseConnecting')
const router = express.Router();
dotenv.config();

router.get('/', async function (req, res, next) {
    let userAgent = req.headers;
    console.log(userAgent)
    res.status(200).send({ msg: 'success' })
})

router.get('/count-websites', async function (req, res, next) {

    res.json({'response': await Websites.countDocuments()});
})

router.get('/websites', async function (req, res, next) {
    res.json(await Websites.find().lean());
})
module.exports = router