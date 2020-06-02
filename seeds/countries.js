const mongoose = require('mongoose')
const Country = require('../models/countries')
const dotenv = require('dotenv')
const change_alias = require('../services/change_alias')
dotenv.config()


mongoose.Promise = global.Promise

// Connect MongoDB at default port 27017.
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/websiteTheme', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    autoIndex: true,
}, async (err) => {
    await Country.createCollection()
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
        let countries = ['Pháp', 'Mỹ', 'Tây Ban Nha', 'Bồ Đào Nha', 'Nhật Bản', 'Úc', 'Việt Nam', 'Trung Quốc', 'Hàn Quốc', 'Ý']
        for (let i = 0; i < countries.length; i++) {
            const name = `${countries[i].toLowerCase()}`
            let data = new Country({
                name: name,
                _id: change_alias(name),
                quantity: 0
            })
            await data.save()
            console.log('-' + countries[i] + ' is saved !')
        }
        await mongoose.connection.close()
    } else {
        console.log('Error in DB connection: ' + err)
    }
})

