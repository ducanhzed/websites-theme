const mongoose = require('mongoose')
const Color = require('../models/colors')
const change_alias = require('../services/change_alias')
const dotenv = require('dotenv')
dotenv.config()


mongoose.Promise = global.Promise

// Connect MongoDB at default port 27017.
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/websiteTheme', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    autoIndex: true,
}, async (err) => {
    await Color.createCollection()
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
        let colors = ['Đen', 'Đỏ', 'Lục', 'Lam', 'Tím', 'Vàng', 'Trắng', 'Chàm', 'Nâu', 'Cam']
        for (let i = 0; i < colors.length; i++) {
            const name = `${colors[i].toLowerCase()}`;
            let data = new Color({
                name: name,
                _id: change_alias(name),
                quantity: 0
            })
            await data.save()
            console.log('-' + colors[i] + ' is saved !')
        }
        await mongoose.connection.close()
    } else {
        console.log('Error in DB connection: ' + err)
    }
})
