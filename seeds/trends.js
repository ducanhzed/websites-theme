const mongoose = require('mongoose');
const Trend = require('../models/trends')
const dotenv = require('dotenv')
const change_alias = require('../services/change_alias')

dotenv.config()

const dataSet = ['Thời trang', 'Cổ điển', 'Nội Thất', 'Trẻ Trung', 'Thể Thao', 'Sáng Tạo', 'Làm đẹp', 'Sang Trọng']

mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/websiteTheme', {
    useNewUrlParser: true,
    useCreateIndex: true,
}, async (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')

        await Trend.createCollection();
        for (let i in dataSet) {
            let seed = ({ name: dataSet[i].toLowerCase() })
            seed['_id'] = change_alias(seed.name)

            try {
                seed = new Trend(seed)
                await seed.save()
                console.log(dataSet[i] + ' is saved !')
            }
            catch (err) {
                console.log(' There was an error when trying to save this Trend (duplicated)!')
            }
        }
        await mongoose.connection.close()
    } else {
        console.log('Error in DB connection: ' + err)
    }
});

