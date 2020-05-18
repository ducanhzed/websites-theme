const mongoose = require('mongoose');
const News = require('../models/news')

mongoose.Promise = global.Promise;

async function mongooseConnecting() {
    mongoose.connect('mongodb://localhost:27017/websiteTheme', {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
    }, (err) => {
        if (!err) {
            console.log('MongoDB Connection Succeeded.')
        } else {
            console.log('Error in DB connection: ' + err)
            throw new Error(err);
        }
    });
}
// Connect MongoDB at default port 27017.
mongoose.connect('mongodb://localhost:27017/DB Name', {
    useNewUrlParser: true,
    useCreateIndex: true,
}, (err) => {
    if (!err) {
        console.log('MongoDB Connection Succeeded.')
    } else {
        console.log('Error in DB connection: ' + err)
    }
});


class NewsService {
    constructor() {

    }

    getNews = async (skip, limit) => {
        return News.find({}).skip(skip).limit(limit).sort({createdDate: -1}).lean()
    }
}

// main
(async () => {
    await mongooseConnecting()
    console.log()
})()