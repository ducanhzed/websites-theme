var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/tin-tuc', function(req, res, next) {
  res.render('news');
});

router.get('/danh-muc-web', function(req, res, next) {
  res.render('category-product');
});

router.get('/editor-js', function(req, res, next) {
  res.render('editor');
});


module.exports = router;
