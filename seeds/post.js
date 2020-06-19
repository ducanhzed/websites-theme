const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Post = require('../models/posts')

dotenv.config()
mongoose.Promise = global.Promise

// Connect MongoDB at default port 27017.
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/websiteTheme', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    autoIndex: true,
}, async (err) => {
    if (!err) {
        await Post.createCollection()
        console.log('MongoDB Connection Succeeded.')
        let authors = ['Jack Nathan', 'Đức Anh', 'Phước Nguyễn', 'Đăng Huy']
        for (let i = 0; i < 1000; i++) {
            let seed = {
                title: 'This is Post ' + Date.now(),
                content: '<h1>This is a heading</h1>' + `<img src="./image.png"></img>` + "<p>This is a content</p>" + "<p>This is another content</p>",
                author: authors[Math.round(Math.random() * (authors.length - 1))],
            }

            let doc = new Post(seed)
            await doc.save()
            console.log(` - Post ${i} is saved !!!`)
        }
        await mongoose.connection.close();
    } else {
        console.log('Error in DB connection: ' + err)
    }
})
