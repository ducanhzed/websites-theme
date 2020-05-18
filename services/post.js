const mongoose = require('mongoose');
const Posts = require('../models/posts')


mongoose.Promise = global.Promise;

// Connect MongoDB at default port 27017.
mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/websiteTheme', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});

class PostServices {
    constructor() {

    }
    findPostById = async (id = new mongoose.Types.ObjectId) => {
        return await Posts.findOne({ _id: `${id}` })
    }
}

// main
/*
(async () => {
    let postServices = new PostServices();
    console.log(await postServices.findPostById('5ebe46c4cd0a2524409755ec'));
    await mongoose.connection.close()
})()
 */

 module.exports = PostServices;