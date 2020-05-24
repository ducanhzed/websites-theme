const Websites = require('../models/websites')
const mongoose = require('mongoose');
const dotenv = require('dotenv')

dotenv.config()
mongoose.Promise = global.Promise;
const WEB_PER_PAGE = 8;
const WEB_PER_ROW = 4;

// Connect MongoDB at default port 27017.
async function mongooseConnecting() {
    mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/websiteTheme', {
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

class WebsiteService {
    constructor() {
    }

    countAllWebsite = async () => {
        let numOfWebsites = await Websites.find().countDocuments();
        return numOfWebsites;
    }

    findNewWebsite = async (num = 1) => {
        await mongooseConnecting()
        const numOfWebsites = await this.countAllWebsite()
        let websites = await Websites.find().skip(numOfWebsites - num * WEB_PER_ROW).limit(WEB_PER_ROW).sort({ createdDate: -1 }).lean();
        await mongoose.connection.close()
        return websites.reverse()
    }

    findWebsiteWithCriteria = async (args, skip = 0, limit = WEB_PER_PAGE) => {
        for (let value in args) {
            if (typeof value == 'string') {
                value = value.toLowerCase()
            }
        }
        return (typeof args == 'object') ? (await Websites.find(args).skip(skip).limit(limit).sort({ createdDate: 1 }).lean()) : null
    }

    findWebsiteWithColor = async (color_name, skip = 0, limit = WEB_PER_PAGE) => {
        color_name = color_name.toString().toLowerCase();
        return await (Websites.find({ color: color_name }).skip(skip).limit(limit).sort({ createdDate: -1 }).lean())
    }

    findWebsiteWithCountry = async (country_name, skip = 0, limit = WEB_PER_PAGE) => {
        country_name = country_name.toString().toLowerCase();
        console.log(country_name)
        return await (Websites.find({ country: country_name }).skip(skip).limit(limit).sort({ createdDate: -1 }).lean())
    }
    findWebsiteByPriceRange = async (gte, lte, skip = 0, limit = WEB_PER_PAGE) => {
        try {
            lte = parseFloat(lte)
            gte = parseFloat(gte)
            if (lte && gte) {
                return await Websites.find({ $and: [{ price: { $gte: gte } }, { price: { $lte: lte } }] })
                    .skip(skip).limit(limit).sort({createdDate: -1})
            }
            else throw 'invalid number'
        }
        catch (err) {
            console.log(err)
            return null
        }
    }

    findWebsiteByID = async (id) => {
        return Websites.findById(`${id}`);
    }
}


// main
/* (async () => {
    await mongooseConnecting();
    let websiteService = new WebsiteService();
    console.log(await websiteService.findWebsiteByID('5ebe49f69a21cd22109282e4'))

    await mongoose.connection.close()
})() */

module.exports = WebsiteService