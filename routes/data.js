const express = require('express')
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

router.get('/new-products/', async (req, res, next) => {
    console.log(process.env.DB_URI)
    res.send('look at console !')
})

router.get('/', async function (req, res, next) {
    res.status(200).send('Giận thực sự !');
})
module.exports = router