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
    res.render('admin-index', { title: 'Admin Page' });
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
})

router.get('/:type', (req, res, next) => {
    const type = req.params.type;
    if (type === 'news' || type === 'websites') {
        res.render('admin-action', { type: type });
    } else res.redirect('/admin');
});

router.get('/:type/create', (req, res, next) => {
    const type = req.params.type;
    if (type === 'news' || type === 'websites') {
        res.render('admin-create', { type: type });
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
            res.render('admin-modify', { instance: new_instance, type });
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
            res.render('admin-modify', { instance: website_instance, type });
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

router.post('/:type/delete/:id', (req, res, next) => {
    const type = req.params.type;
    const id = req.params.id;
    if (type === 'news') {

    } else if (type === 'websites') {

    } else res.redirect('/admin');
});

module.exports = router;