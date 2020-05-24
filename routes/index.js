var express = require('express');
const WebsiteService = require('../services/websites')

var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'KUMOP DESIGN' });
});
router.get('/tin-tuc', function (req, res, next) {
  res.render('news');
});

router.get('/danh-muc-web', function (req, res, next) {
  res.render('category-product');
});

router.get('/editor-js', function (req, res, next) {
  res.render('editor');
});


router.get('/test', async function (req, res, next) {
  const websiteService = new WebsiteService();
  const newWebsites = await websiteService.findNewWebsite();
  const careWebsites = await websiteService.findNewWebsite(2);
  const worldWebsites = await websiteService.findNewWebsite(3);
  res.render('index copy', { title: 'KUMOP COPY', newWebsites, careWebsites, worldWebsites });
})


module.exports = router;
