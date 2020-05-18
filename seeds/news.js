const mongoose = require('mongoose');
const News = require('../models/news')
mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/websiteTheme', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    autoIndex: true,
}, async (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
        let countries = ['Pháp', 'Mỹ', 'Tây Ban Nha', 'Bồ Đào Nha', 'Nhật Bản', 'Úc', 'Việt Nam', 'Trung Quốc']
        let colors = ['Đen', 'Đỏ', 'Lục', 'Lam', 'Tím', 'Vàng', 'Trắng', 'Chàm', 'Nâu', 'Cam']
        let authors = ['Jack Nathan', 'Đức Anh', 'Phước Nguyễn', 'Đăng Huy']
        for (let i = 0; i < 10; i++) {
            let seed = {
                title: 'This is News title ' + Date.now(),
                content: ['Lorem ipsum dolor asit ect amec', `<img src="./image.png"></img>`, "This is a content", "This is another content"],
                author: authors[Math.round(Math.random() * (authors.length - 1))],
                points: [0],
                tags: [countries[Math.round(Math.random() * (countries.length - 1))].toLowerCase(), colors[Math.round(Math.random() * (colors.length - 1))].toLowerCase()]
            }
            let news = new News(seed)
            await news.save()
            console.log(`- news ${i} is saved !`)
            console.log(seed.tags)
            await setTimeout(()=>{}, 200)
        }
        await mongoose.connection.close()
    } else {
        console.log('Error in DB connection: ' + err)
    }
});
