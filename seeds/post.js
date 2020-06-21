const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Post = require('../models/posts')

dotenv.config()
mongoose.Promise = global.Promise
const CONTENT = `                <h3>Thông tin chi tiết sản phẩm</h3>
<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
    Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit
    amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit
    amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae,
    ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci,
    sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent
    dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat.
    Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
<ul>
    <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
    <li>Aliquam tincidunt mauris eu risus.</li>
    <li>Vestibulum auctor dapibus neque.</li>
</ul>

<img class="image" src="/images/websites/img_7.jpg" alt="">
<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
    Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit
    amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit
    amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae,
    ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci,
    sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent
    dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat.
    Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
<h3>Pede Donec Dignissim</h3>
<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.
    Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit
    amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo. Quisque sit
    amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, commodo vitae,
    ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci,
    sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis. Praesent
    dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat.
    Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>`
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
                content: CONTENT,
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
