var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var passport = require('passport');
var csrf = require('csurf')();
var mongooseConnecting = require('../services/mongooseConnecting');
var AdminService = require('../services/admin');
var router = express.Router();

require('../models/posts');
require('../models/news');
require('../models/websites');
require('../models/countries');
require('../models/colors');
require('../models/trends');
require('../models/fields');

var Service = new AdminService();
//mongoose.connection.readyState || mongooseConnecting();

router.use(session({
    name: 'session_id',
    secret: 'my-really-strong-secret-123', // Please put it to secret place :>
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
Service.passportConfig();

router.use(passport.initialize());
router.use(passport.session());
router.use(csrf);

/* Admin main page */
router.get('/', Service.needLogin, (req, res, next) => {
    Promise.all([
        mongoose.model('Websites').countDocuments(),
        mongoose.model('news').countDocuments()
    ]).then(([websites, news]) => {
        res.render('admin-index', { title: 'Admin Page', totalWebsites: websites, totalNews: news });
    }).catch(err => {
        next(new Error('Something went wrong'));
    });
});

/* Login page */
router.get('/login', Service.needNotLogin, (req, res, next) => {
    const message = req.session.messages ? req.session.messages[0] : null;
    req.session.messages = null;
    res.render('admin-login', { title: 'Login', csrfToken: req.csrfToken(), message: message });
});

/* Login feature */
router.post('/login', Service.needNotLogin, passport.authenticate('local.signin', { failWithError: true, failureMessage: true }),
    (req, res, next) => {
        if (req.xhr) {
            var oldUrl = req.session.oldUrl;
            req.session.oldUrl = null;
            res.json({ message: 'Log in successfully', oldUrl: oldUrl });
        } else if (req.session.oldUrl) {
            var oldUrl = req.session.oldUrl;
            req.session.oldUrl = null;
            res.redirect(oldUrl);
        } else res.redirect('/admin');
    }, (err, req, res, next) => {
        if (req.xhr) {
            const message = req.session.messages ? req.session.messages[0] : '';
            req.session.messages = null;
            res.status(404).json({ message: message });
        } else res.redirect('/admin/login');
    }
);

router.use(Service.needLogin);

router.get('/logout', (req, res, next) => {
    req.logOut();
    res.redirect('/admin/login');
});

router.get('/get-all-tags', (req, res, next) => {
    const name = req.query.query;
    if (name === '') return res.json([]);
    Promise.all([
        mongoose.model('Countries').find({ name: new RegExp(name, 'gi') }),
        mongoose.model('colors').find({ name: new RegExp(name, 'gi') }),
        mongoose.model('trends').find({ name: new RegExp(name, 'gi') }),
        mongoose.model('fields').find({ name: new RegExp(name, 'gi') }),
    ]).then(response => {
        const result = response[0].concat(response[1], response[2], response[3]);
        res.json(result);
    }).catch(err => next(new Error("Something went wrong")));
});


router.get('/property/:type', async (req, res, next) => {
    const propertyAccept = ['Countries', 'colors', 'trends', 'fields'];
    if (propertyAccept.includes(req.params.type)) {
        const { name = '', skip = 0 } = req.query;

        const data = await mongoose.model(req.params.type).find({ name: new RegExp(name, 'gi') }).skip(Number(skip)).limit(20).lean();
        const totalCount = await mongoose.model(req.params.type).find({ name: new RegExp(name, 'gi') }).countDocuments();

        if (req.xhr) {
            res.json({
                data: data,
                count: data.length,
                totalCount: totalCount,
                type: req.params.type.toLowerCase(),
                originalType: req.params.type
            });
        } else res.render('admin-property', { title: 'Property', data: data, count: data.length, totalCount: totalCount, type: req.params.type.toLowerCase(), originalType: req.params.type });
    } else {
        if (req.xhr) res.status(404).json({ error: "Invalid type of property" });
        else res.redirect('/admin');
    }
})

router.get('/:type', async (req, res, next) => {
    const type = req.params.type;
    if (type === 'news') {
        console.log('news: ', req.query);

        const data = await mongoose.model('news').find().limit(20).lean();
        const totalCount = mongoose.model('news').countDocuments();
        data.forEach(newDoc => newDoc.points = newDoc.points.reduce((total, cur) => total + cur, 0));

        if (req.xhr) res.json({ data: data, count: data.length, totalCount: await totalCount });
        else res.render('admin-action', { type: type, data: data, count: data.length, totalCount: await totalCount, title: 'List of ' + type, csrfToken: req.csrfToken() });
    } else if (type === 'websites') {
        const { name = '', skip = 0, numOfCols, field, country, color, trend, author = '', maxPrice = 9999999999, minPrice = 0 } = req.query;
        const data = await mongoose.model('Websites').find({
            name: new RegExp(name, 'gi'),
            author: new RegExp(author, 'gi'),
            numOfCols: numOfCols ? numOfCols : { $gt: -1 },
            field: field ? field : /.*/,
            country: country ? country : /.*/,
            color: color ? color : /.*/,
            trend: trend ? trend : /.*/,
            price: { $gte: minPrice, $lte: maxPrice }
        }).skip(Number(skip)).limit(20).lean();

        const totalCount = mongoose.model('Websites').find({
            name: new RegExp(name, 'gi'),
            author: new RegExp(author, 'gi'),
            numOfCols: numOfCols ? numOfCols : { $gt: -1 },
            field: field ? field : /.*/,
            country: country ? country : /.*/,
            color: color ? color : /.*/,
            trend: trend ? trend : /.*/,
            price: { $gte: minPrice, $lte: maxPrice }
        }).countDocuments();

        if (req.xhr) return res.json({ data: data, count: data.length, totalCount: await totalCount, });
        else res.render('admin-action', { type: type, data: data, count: data.length, totalCount: await totalCount, title: 'List of ' + type, csrfToken: req.csrfToken() });
    } else res.redirect('/admin');
});

router.get('/:type/create', (req, res, next) => {
    const type = req.params.type;
    if (type === 'news' || type === 'websites') {
        res.render('admin-create', { type: type, csrfToken: req.csrfToken() });
    } else res.redirect('/admin');
});

router.post('/:type/create', (req, res, next) => {
    const type = req.params.type;
    if (type === 'news') {

    } else if (type === 'websites') {

    } else res.redirect('/admin');
});

router.get('/:type/modify/:id', async (req, res, next) => {
    const type = req.params.type;
    const id = req.params.id;

    if (type === 'news') {
        const News = mongoose.model('news');
        const new_instance = await News.findById(id).lean();
        if (new_instance) {
            //res.json(new_instance);
            new_instance.tags = new_instance.tags.join(',');
            new_instance.keywords = new_instance.keywords.join(',');

            res.render('admin-modify', { instance: new_instance, type, csrfToken: req.csrfToken() });
        } else {
            const error = new Error('Not Found');
            error.status = 404;
            next(error);
        }
    } else if (type === 'websites') {
        const Websites = mongoose.model('Websites');
        const website_instance = await Websites.findById(id).lean();
        if (website_instance) {
            const Posts = mongoose.model('posts');
            const post = await Posts.findById(website_instance.details);
            website_instance.details = post;
            res.render('admin-modify', { instance: website_instance, type, csrfToken: req.csrfToken() });
            //res.json(website_instance);
        } else {
            const error = new Error('Not Found');
            error.status = 404;
            next(error);
        }
    } else res.redirect('/admin');
});

router.post('/:type/modify/:id', (req, res, next) => {
    const type = req.params.type;
    const id = req.params.id;
    if (type === 'news') {

    } else if (type === 'websites') {

    } else res.redirect('/admin');
});

router.post('/:type/delete', (req, res, next) => {
    const type = req.params.type;
    const ids = req.body.ids; // array of ids

    if (type === 'news') {

    } else if (type === 'websites') {

    } else res.redirect('/admin');
});

router.post('/find/:type', async (req, res, next) => {
    const findAccept = ['Countries', 'colors', 'trends', 'fields'];
    if (findAccept.includes(req.params.type)) {
        const name = req.body.value.toLowerCase().trim();
        if (name === '') res.json({ data: [] });

        const data = await mongoose.model(req.params.type).find({ name: new RegExp(name, 'gi') });
        res.json({ data: data });
    } else next(new Error("Invalid type of params"));
});

module.exports = router;