const mongoose = require('mongoose');
const News = require('../models/news')
let titleToLink = require('../services/change_alias')

mongoose.Promise = global.Promise;
const DOMAIN = 'http://192.168.1.7:3000'

// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/websiteTheme', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    autoIndex: true,
}, async (err) => {
    if (!err) {
        await News.createCollection()
        console.log('MongoDB Connection Succeeded.')
        let countries = ['Pháp', 'Mỹ', 'Tây Ban Nha', 'Bồ Đào Nha', 'Nhật Bản', 'Úc', 'Việt Nam', 'Trung Quốc']
        let colors = ['Đen', 'Đỏ', 'Lục', 'Lam', 'Tím', 'Vàng', 'Trắng', 'Chàm', 'Nâu', 'Cam']
        let authors = ['Jack Nathan', 'Đức Anh', 'Phước Nguyễn', 'Đăng Huy']
        let avatars = [
            '/images/news/img_1.jpg',
            '/images/news/img_2.jpg',
            '/images/news/img_3.jpg',
            '/images/news/img_4.jpg',
            '/images/news/img_5.png',
            '/images/news/img_6.jpg',
            '/images/news/img_7.jpg',]

        let regex = /([^\w\s\d])/g
        let keywords = `lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et`;
        keywords = keywords.replace(regex, '').split(' ');
        console.log(keywords)

        let tags = 'dolore magna aliqua. Nisl tincidunt eget nullam non. Quis hendrerit dolor magna eget est lorem ipsum dolor sit. Volutpat odio facilisis mauris sit amet massa.';
        tags = tags.replace(regex, '').split(' ');

        let getTag = () => tags[Math.floor(Math.random() * tags.length - 1)].toLowerCase();
        let getKeyword = () => keywords[Math.floor(Math.random() * (keywords.length - 1))].toLowerCase();
        let getAvatar = () => avatars[Math.floor(Math.random() * (avatars.length - 1))]
        let getCountry = () => countries[Math.floor(Math.random() * (countries.length - 1))].toLowerCase()
        let getColor = () => colors[Math.floor(Math.random() * (colors.length - 1))].toLowerCase()
        for (let i = 0; i < 500; i++) {
            let seed = {
                title: 'Tin Tức ' + Date.now() + ' tiếng việt !',
                content: '<p>Lorem ipsum dolor asit ect amec</p>' + `<img src="${avatars[Math.floor(Math.random() * avatars.length)]}"></img>` + "<p>This is a content</p>" + "<p>This is another content</p>",
                author: authors[Math.round(Math.random() * (authors.length - 1))],
                points: [0],
                tags: [getCountry(), getColor()],
                keywords: [getKeyword(), getKeyword(), getKeyword()],
                avatar: getAvatar(),
            }

            seed['_id'] = titleToLink(seed.title)
            //console.log(seed)
            try {
                let news = new News(seed)
                await news.save()
                console.log(`- news ${i + 1} is saved !`)
                console.log(seed.tags)
            }
            catch (err) { console.log(err) }
        }
        await mongoose.connection.close()
    } else {
        console.log('Error in DB connection: ' + err)
    }
});
