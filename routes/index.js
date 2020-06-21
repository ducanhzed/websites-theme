var express = require('express');
const WebsiteService = require('../services/websites')
const NewsService = require('../services/news')

//model categories
const Trends = require('../models/trends')
const Colors = require('../models/colors')
const Countries = require('../models/countries')
const Fields = require('../models/fields')

const websiteService = new WebsiteService();
const newsService = new NewsService();

const mongoose = require('mongoose')

var router = express.Router();

const CARDS_PER_CATE_PAGE = 16
const MAX_PRICE = 500000000
/* GET home page. */

router.get('/tin-tuc', async function (req, res, next) {
  const menu = await getMenu();
  const newsCount = await newsService.count()
  let paginationArr = []

  //get pagination Arr
  for (let i = 1; i <= newsCount; i++) {
    paginationArr.push(i)
  }

  // pagination URL request
  let skip = 0
  if (req.query['pageNumber']) {
    skip = (req.query.pageNumber > 0 && (req.query.pageNumber - 1) * CARDS_PER_CATE_PAGE <= newsCount) ? req.query.pageNumber * CARDS_PER_CATE_PAGE : 1
  }

  let news = await newsService.getNews(skip, CARDS_PER_CATE_PAGE)
  res.render('all-news', { title: 'Tin Tức', news, menu, paginationArr });
});

router.get('/danh-muc-websites', async function (req, res, next) {
  // get query info & tags for relative news
  let query = { price: { $gte: -1, $lte: MAX_PRICE } }
  let tagsOrKeyWordsForNews = [];
  if (req.query.highPrice) {
    query.price.$lte = req.query.highPrice
  }
  if (req.query.lowPrice) {
    query.price.$gte = req.query.lowPrice
  }
  if (req.query.country) {
    query.country = req.query.country
    tagsOrKeyWordsForNews.push(`\"${query.country}\"`)
  }
  if (req.query.color) {
    query.color = req.query.color
    tagsOrKeyWordsForNews.push(`\"${query.color}\"`)
  }
  if (req.query.numOfCols) {
    query.numOfCols = req.query.numOfCols
    tagsOrKeyWordsForNews.push(`\"${query.numOfCols}\"`)
  }
  if (req.query.trend) {
    query.trend = req.query.trend
    tagsOrKeyWordsForNews.push(`\"${query.trend}\"`)
  }
  if (req.query.field) {
    query.field = req.query.field
    tagsOrKeyWordsForNews.push(`\"${query.field}\"`)
  }
  tagsOrKeyWordsForNews = tagsOrKeyWordsForNews.join(' ');
  console.log(query)

  //getting data by query

  const menu = await getMenu()

  //for pagination
  let skip = (req.query.pageNumber && req.query.pageNumber > 0) ? req.query.pageNumber - 1 : 0;
  const numOfWebsites = await websiteService.count(query)

  let length = (numOfWebsites) ? Math.round(numOfWebsites / CARDS_PER_CATE_PAGE) : 0;
  if (numOfWebsites > length * CARDS_PER_CATE_PAGE) length++;
  if (skip * CARDS_PER_CATE_PAGE > numOfWebsites) next();

  const websites = await websiteService.findWebsiteWithCriteria(query, skip * CARDS_PER_CATE_PAGE, CARDS_PER_CATE_PAGE)
  const news = await newsService.findNewsbyTagsOrKeywords(tagsOrKeyWordsForNews, Math.floor(Math.random() * CARDS_PER_CATE_PAGE));

  websitesPaginationArr = [];

  for (let i = 1; i <= length; i++) {
    websitesPaginationArr.push(i);
  }

  console.log(websitesPaginationArr)
  console.log(numOfWebsites)
  console.log(tagsOrKeyWordsForNews)

  res.render('category-product', { title: 'Danh mục Website', menu, websites, news, websitesPaginationArr });
});

router.get('/editor-js', function (req, res, next) {
  res.render('editor');
});


router.get('/', async function (req, res, next) {
  const newWebsites = await websiteService.findNewWebsite();
  const careWebsites = await websiteService.findNewWebsite(2);
  const worldWebsites = await websiteService.findNewWebsite(3);
  const news = await newsService.getNews();
  let menu = await getMenu()

  //console.log(req.headers);

  res.render('index', {
    title: 'KUMOP',
    newWebsites,
    careWebsites,
    worldWebsites,
    news,
    menu,
  });
})



/* async function mongooseConnecting() {
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
} */

router.get('/websites/:id', async function (req, res, next) {
  const websitesService = new WebsiteService();
  if (req.params.id) {
    let website = await websitesService.findWebsiteByID(`${req.params.id}`)
    let menu = await getMenu()

    if (website) {
      let recent = req.cookies.recent ? JSON.parse(req.cookies.recent) : [];
      if (!recent.includes(req.params.id)) {
        recent.unshift(req.params.id);
        recent = recent.slice(0, 10);
        res.cookie('recent', JSON.stringify(recent), { maxAge: 3600 * 24 * 1000, httpOnly: true });
      } else {
        // Pick that website id to top of list 
        recent = recent.filter(id => id !== req.params.id);
        recent.unshift(req.params.id);
        recent = recent.slice(0, 10);
        res.cookie('recent', JSON.stringify(recent), { maxAge: 3600 * 24 * 1000, httpOnly: true });
      }


      res.render('website', { title: website.title, website, menu });
    }
    else next();
  }
})

router.get('/tin-tuc/:id', async function (req, res, next) {
  const newsService = new NewsService();
  if (req.params.id) {
    let news = await newsService.findNewsByID(`${req.params.id}`)
    if (news) {
      res.status(200).send(news);
    }
    else next()
  }
})


router.get('/editor', async function (req, res, next) {
  res.render('editor')
})

function getCollums() {
  let result = [];
  for (let i = 1; i <= 12; i++) {
    result.push(i);
  }
  return result;
}

async function getMenu() {
  let trends = await Trends.find().lean();
  let fields = await Fields.find().lean();
  let countries = await Countries.find().lean();
  let colors = await Colors.find().lean();

  let menu = {
    trends: trends,
    fields: fields,
    colors: colors,
    countries: countries,
    cols: getCollums()
  };

  return new Promise((resolve, reject) => {
    resolve(menu)
  })
}
module.exports = router;
