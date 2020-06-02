const Websites = require('../models/websites')
const mongoose = require('mongoose');
const dotenv = require('dotenv')

dotenv.config()
mongoose.Promise = global.Promise;
const WEB_PER_PAGE = 8;
const WEB_PER_ROW = 4;

// Connect MongoDB at default port 27017.

class WebsiteService {
    constructor() {
    }

    count = async (query = {}) => {
        const counts = await Websites.find(query).countDocuments()
        return counts
    }

    findNewWebsite = async (num = 1) => {
        const numOfWebsites = await this.count()
        let websites = await Websites.find().skip(numOfWebsites - num * WEB_PER_ROW).limit(WEB_PER_ROW).sort({ createdDate: -1 }).lean();
        return websites
    }

    findWebsiteWithCriteria = async (args, skip = 0, limit = WEB_PER_PAGE) => {
        for (let key in args) {
            if (typeof args[key] == 'string') {
                args[key] = args[key].toLocaleLowerCase()
            }
        }
        return (typeof args == 'object') ? (await Websites.find(args).skip(skip).limit(limit).sort({ createdDate: -1 }).lean()) : null
    }

    findWebsiteWithColor = async (color_name, skip = 0, limit = WEB_PER_PAGE) => {
        color_name = color_name.toString().toLowerCase();
        const websites = await (Websites.find({ color: color_name }).skip(skip).limit(limit).sort({ createdDate: -1 }).lean())
        return websites
    }

    findWebsiteWithCountry = async (country_name, skip = 0, limit = WEB_PER_PAGE) => {
        country_name = country_name.toString().toLowerCase();
        console.log(country_name)
        const websites = await (Websites.find({ country: country_name }).skip(skip).limit(limit).sort({ createdDate: -1 }).lean())
        return websites
    }
    findWebsiteByPriceRange = async (gte, lte, skip = 0, limit = WEB_PER_PAGE) => {
        try {
            lte = parseFloat(lte)
            gte = parseFloat(gte)
            if (lte && gte) {
                const websites = await Websites.find({ $and: [{ price: { $gte: gte } }, { price: { $lte: lte } }] })
                    .skip(skip).limit(limit).sort({ createdDate: -1 })
                return websites
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