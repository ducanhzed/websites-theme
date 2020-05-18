const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Website = require('../models/websites')
const Posts = require('../models/posts')
const Fields = require('../models/fields')

mongoose.Promise = global.Promise
dotenv.config()

// Connect MongoDB at default port 27017.
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/websiteTheme', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    autoIndex: true,
}, async (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
        await Website.createCollection()
        let postIDs = await Posts.find().limit(50)
        postIDs = postIDs.map(e => e['_id'])
        //console.log(postIDs)  - to debugging

        let countries = ['Pháp', 'Mỹ', 'Tây Ban Nha', 'Bồ Đào Nha', 'Nhật Bản', 'Úc', 'Việt Nam', 'Trung Quốc']
        let colors = ['Đen', 'Đỏ', 'Lục', 'Lam', 'Tím', 'Vàng', 'Trắng', 'Chàm', 'Nâu', 'Cam']
        let authors = ['Jack Nathan', 'Đức Anh', 'Phước Nguyễn', 'Đăng Huy']
        let fields = await Fields.find({}).lean();

        for (let i = 1; i <= 50; i++) {
            let seed = {
                name: `website ${Date.now()}`,
                images: ['img_1', 'img_2', 'img_3', 'img_4'],
                color: colors[Math.round(Math.random() * (colors.length - 1))].toLocaleLowerCase(),
                country: countries[Math.round(Math.random() * (countries.length - 1))].toLocaleLowerCase(),
                field: fields[Math.round(Math.random() * (fields.length - 1))].name.toLocaleLowerCase(),
                price: Math.round(Math.random() * 10000000 + 5000000),
                author: authors[Math.round(Math.random() * (authors.length - 1))],
                details: mongoose.Types.ObjectId(postIDs[Math.round(Math.random() * (postIDs.length - 1))])
            }
            let website = new Website(seed)
            await website.save()
            console.log(` - data ${i} is saving... !`)
            console.log(`--------------${seed.field}----------------`)
            await setTimeout(()=>{}, 200)
        }
        await mongoose.connection.close()
    } else {
        console.log('Error in DB connection: ' + err)
    }
})


