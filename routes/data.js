const express = require('express')
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

router.get('/', async (req, res, next) => {
    console.log(JSON.stringify(req.headers))
    res.json({ msg: 'success' })
})
module.exports = router