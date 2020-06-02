const mongoose = require('mongoose');
const News = require('../models/news')
const dotenv = require('dotenv')

dotenv.config()
mongoose.Promise = global.Promise;

async function mongooseConnecting() {
    return mongoose.connect('mongodb://localhost:27017/websiteTheme', {
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

class NewsService {
    constructor() {
    }

    getNews = async (skip = 0, limit = 8) => {
        return News.find({}).skip(skip).limit(limit).sort({ createdDate: -1 }).lean()
    }

    findNewsbyTagsOrKeywords = async (stringOfText, skip = 0, limit = 8) => {
        return News.find({ '$text': { $search: `${stringOfText}` } }).skip(skip).limit(limit).sort({ createdDate: -1 }).lean()
    }

    findNewsByID = async (id) => {
        return News.findOne({ _id: `${id}` })
    }

    count = async () => {
        return News.countDocuments()
    }
}
/* // main
(async () => {
    await mongooseConnecting()
    let newsService = new NewsService();
    console.log(await newsService.findNewsByID('5ec2c56df6c08747a8477f1c'))
    await mongoose.connection.close();
})() */

module.exports = NewsService