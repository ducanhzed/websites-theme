var express = require('express');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var passport = require('passport');
var fs = require('fs');
var path = require('path');
var csrf = require('csurf')();
var AdminService = require('../services/admin');
var change_alias = require('../services/change_alias');
var router = express.Router();

var Service = new AdminService();
var multer = require('multer');
var storage = multer.diskStorage(Service.multerConfig());
var upload = multer({ storage: storage });

var updateStorage = multer.diskStorage(Service.multerConfigUpdateWebsite());
var updateImageWebsite = multer({ storage: updateStorage });
var NUM_OF_IMAGES = 4;

require('../models/posts');
require('../models/news');
require('../models/websites');
require('../models/countries');
require('../models/colors');
require('../models/trends');
require('../models/fields');
require('../models/user');

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
router.use((req, res, next) => {
    const user = req.user || {};
    user.name && (user.cap_name = user.name.slice(0, 1).toUpperCase() + user.name.slice(1));
    user.role && (user.cap_role = user.role.slice(0, 1).toUpperCase() + user.role.slice(1));
    res.locals.user = user;
    next();
})

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

/* Protect these route: need login to access */
router.use(Service.needLogin);

/* Admin main page */
router.get('/', (req, res, next) => {
    Promise.all([
        mongoose.model('Websites').countDocuments(),
        mongoose.model('news').countDocuments()
    ]).then(([websites, news]) => {
        res.render('admin-index', { title: 'Admin Page', totalWebsites: websites, totalNews: news });
    }).catch(err => {
        next(new Error('Something went wrong'));
    });
});

/* Logout feature */
router.get('/logout', (req, res, next) => {
    req.logOut();
    res.redirect('/admin/login');
});

/* User Management */
router.get('/user', async (req, res, next) => {
    try {
        const { skip = 0 } = req.query;
        if (Number.isNaN(Number(skip))) return res.redirect('/admin/user');
        const users = await mongoose.model('users').find({}, 'name role _id').skip(Number(skip)).lean().limit(10);
        const totalCount = await mongoose.model('users').countDocuments();

        if (req.xhr) {
            res.json({ users: users, count: users.length, totalCount: totalCount });
        } else res.render('admin-user', { title: "Change role of user", users: users, count: users.length, totalCount: totalCount });
    } catch (err) {
        next(err);
    }
});

router.get('/user/create', (req, res, next) => {
    const message = req.session.messages || [];
    req.session.messages = null;
    res.render('admin-addUser', { title: 'Add user', csrfToken: req.csrfToken(), message: message, haveMessage: message.length > 0 });
});

router.post('/user/create', async (req, res, next) => {
    try {
        let { name = '', password = '', role = '' } = req.body;
        [name, password, role] = [name, password, role].map(val => val.trim());

        if (!name || !password || !role) {
            req.session.messages || (req.session.messages = []);
            req.session.messages.push({ type: 'danger', message: `Username, password or role is missing` });
            return res.redirect('/admin/user/create');
        }

        const regexName = /^[A-Za-z0-9@_\.]+$/;
        if (!regexName.test(name)) {
            req.session.messages || (req.session.messages = []);
            req.session.messages.push({ type: 'danger', message: `Username can only contain character and number` });
            return res.redirect('/admin/user/create');
        }

        if (password.length < 6) {
            req.session.messages || (req.session.messages = []);
            req.session.messages.push({ type: 'danger', message: `Password must at least 6 character length` });
            return res.redirect('/admin/user/create');
        }

        if (!['admin', 'manager', 'editor'].includes(role)) {
            req.session.messages || (req.session.messages = []);
            req.session.messages.push({ type: 'danger', message: `Invalid value of role` });
            return res.redirect('/admin/user/create');
        }

        const exist = await mongoose.model('users').findOne({ name: name });
        if (exist) {
            req.session.messages || (req.session.messages = []);
            req.session.messages.push({ type: 'danger', message: `Username is already exists. Please choose another username` });
            return res.redirect('/admin/user/create');
        }

        const new_user = mongoose.model('users')({ name, password, role });
        new_user.hashPassword();
        await new_user.save();

        req.session.messages || (req.session.messages = []);
        req.session.messages.push({ type: 'success', message: `User <strong>${name}</strong> was added successfully` });
        res.redirect('/admin/user/create')
    } catch (err) {
        next(err);
    }
});

router.get('/user/modify/:id', (req, res, next) => {
    const id = req.params.id;
    if (mongoose.Types.ObjectId.isValid(id)) {
        mongoose.model('users').findById(id, (err, result) => {
            if (err || !result) res.redirect('/admin/user');
            const message = req.session.messages || [];
            req.session.messages = null;
            res.render('admin-modifyUser', { instance: result, title: 'Modify user', csrfToken: req.csrfToken(), message: message, haveMessage: message.length > 0 })
        });
    } else res.redirect('/admin/user');
});

router.post('/user/modify/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.redirect('/admin/user');

        const { role = '' } = req.body;
        if (!['admin', 'manager', 'editor'].includes(role)) {
            req.session.messages || (req.session.messages = []);
            req.session.messages.push({ type: 'danger', message: `Invalid value of role` });
            return res.redirect(`/admin/user/modify/${id}`);
        }

        await mongoose.model('users').findByIdAndUpdate(id, { role: role });
        req.session.messages || (req.session.messages = []);
        req.session.messages.push({ type: 'success', message: `Updated role successfully` });
        res.redirect(`/admin/user/modify/${id}`);
    } catch (err) {
        next(err);
    }
})

/* Ajax type ahead property for website */
router.get('/get-all-tags', (req, res, next) => {
    const name = (req.query.query || '').trim().toLowerCase();
    if (name === '') return res.json([]);
    Promise.all([
        mongoose.model('Countries').find({ name: new RegExp(name, 'gi') }).limit(10),
        mongoose.model('colors').find({ name: new RegExp(name, 'gi') }).limit(10),
        mongoose.model('trends').find({ name: new RegExp(name, 'gi') }).limit(10),
        mongoose.model('fields').find({ name: new RegExp(name, 'gi') }).limit(10),
    ]).then(response => {
        const result = response[0].concat(response[1], response[2], response[3]);
        res.json(result);
    }).catch(err => {
        if (req.xhr) return res.status(500).json({ message: 'Sorry, something went wrong.' });
        next(new Error("Something went wrong"))
    });
});


router.get('/property/:type', async (req, res, next) => {
    try {
        const propertyAccept = ['Countries', 'colors', 'trends', 'fields'];
        if (propertyAccept.includes(req.params.type)) {
            const { name = '', skip = 0 } = req.query;
            if (Number.isNaN(Number(skip))) return res.redirect('/admin');

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
            } else res.render('admin-property', {
                title: 'Property',
                data: data,
                count: data.length,
                totalCount: totalCount,
                type: req.params.type.toLowerCase(),
                originalType: req.params.type,
                csrfToken: req.csrfToken()
            });
        } else {
            if (req.xhr) res.status(404).json({ error: "Invalid type of property" });
            else res.redirect('/admin');
        }
    } catch (err) {
        next(err);
    }
});

router.post('/property/:type/create', async (req, res, next) => {
    try {
        const propertyAccept = ['Countries', 'colors', 'trends', 'fields'];
        const propertyMap = { 'Countries': 'country', 'colors': 'color', 'trends': 'trend', 'fields': 'field' };

        if (propertyAccept.includes(req.params.type)) {
            const name = (req.body.name || '').trim().toLowerCase();
            if (name == '') return res.status(500).json({ error: "Name property is required" });

            const property = await mongoose.model(req.params.type).findOne({ name: name }).lean();
            if (property) res.status(409).json({ error: "Property is already existed" });
            else {
                const new_property = new mongoose.model(req.params.type)({
                    name: name,
                    quantity: await mongoose.model('Websites').find({ [propertyMap[req.params.type]]: name }).countDocuments(),
                    _id: change_alias(name)
                });
                let exist = await mongoose.model(req.params.type).findOne({ _id: new_property._id }).lean();
                if (exist) new_property._id += `-${Date.now()}`;

                await new_property.save();
                res.json({ message: 'Property ' + name + ' was added successfully', new_property: new_property });
            }
        } else {
            if (req.xhr) res.status(404).json({ error: "Invalid type of property" });
            else res.redirect('/admin');
        }
    } catch (err) {
        next(err);
    }
});

router.post('/property/:type/delete', async (req, res, next) => {
    try {
        const type = req.params.type;
        const ids = (req.body.ids || []).map(id => id.trim()).filter(id => id); // array of ids
        const propertyAccept = ['Countries', 'colors', 'trends', 'fields'];
        if (propertyAccept.includes(type)) {
            const listDelete = await Promise.all(ids.map(id => mongoose.model(type).findByIdAndRemove(id)));
            res.json({ message: 'Removed ' + type.toLowerCase() + ' successfully', countDelete: listDelete.length });
        } else {
            if (req.xhr) res.status(404).json({ error: "Invalid type of property" });
            else res.redirect('/admin');
        }
    } catch (err) {
        next(err);
    }
});

router.get('/:type', async (req, res, next) => {
    try {
        const type = req.params.type;
        if (type === 'news') {
            let { title = '', author = '', tags, keywords, skip = 0 } = req.query;
            if (Number.isNaN(Number(skip))) return res.redirect('/admin');

            let arr = [];
            let query_find = { title: new RegExp(title.trim(), 'gi'), author: new RegExp(author.trim(), 'gi') };
            if (tags) {
                tags = tags.split(',').filter(tag => tag.trim()).map(tag => ({ tags: tag.trim().toLowerCase() }));
                arr = arr.concat(tags);
            }
            if (keywords) {
                keywords = keywords.split(',').filter(keyword => keyword.trim()).map(keyword => ({ keywords: keyword.trim().toLowerCase() }));
                arr = arr.concat(keywords);
            }
            if (arr.length) query_find['$and'] = arr;

            const data = await mongoose.model('news').find(query_find).skip(Number(skip)).limit(20).lean();
            const totalCount = mongoose.model('news').find(query_find).countDocuments();
            data.forEach(newDoc => newDoc.points = newDoc.points.reduce((total, cur) => total + cur, 0));

            if (req.xhr) res.json({ data: data, count: data.length, totalCount: await totalCount });
            else res.render('admin-action', { type: type, data: data, count: data.length, totalCount: await totalCount, title: 'List of ' + type, csrfToken: req.csrfToken() });
        } else if (type === 'websites') {
            const { name = '', skip = 0, numOfCols, field, country, color, trend, author = '', maxPrice = 9999999999, minPrice = 0 } = req.query;
            if (Number.isNaN(Number(skip)) || Number.isNaN(Number(maxPrice)) || Number.isNaN(Number(minPrice)))
                return res.redirect('/admin');
            if (numOfCols && Number.isNaN(Number(numOfCols))) return res.redirect('/admin');

            const data = await mongoose.model('Websites').find({
                name: new RegExp(name.trim(), 'gi'),
                author: new RegExp(author.trim(), 'gi'),
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
    } catch (err) {
        next(err);
    }
});

router.get('/:type/create', (req, res, next) => {
    const type = req.params.type;
    if (type === 'news' || type === 'websites') {
        const message = req.session.messages || [];
        req.session.messages = null;
        res.render('admin-create', { type: type, csrfToken: req.csrfToken(), message: message, haveMessage: message.length > 0 });
    } else res.redirect('/admin');
});

router.post('/:type/create', (req, res, next) => {
    const type = req.params.type;
    if (type === 'news') upload.single('avatar')(req, res, next);
    else if (type === 'websites') upload.array('images')(req, res, next);
    else {
        req.session.messages || (res.session.messages = []);
        req.session.messages.push({ type: 'danger', message: 'Invalid type of products' });
        res.redirect(`/admin/${req.params.type}/create`);
    }
}, async (req, res, next) => {
    try {
        const type = req.params.type;
        if (type === 'news') {
            let { title = '', author = '', tags = '', keywords = '', content = '', avatar } = req.body;

            [title, author, content] = [title, author, content].map(val => val.trim());
            tags = tags.split(',').filter(tag => tag.trim()).map(tag => tag.trim().toLowerCase());
            keywords = keywords.split(',').filter(keyword => keyword.trim()).map(keyword => keyword.trim().toLowerCase());

            if (!title || !author || !content) {
                if (avatar) {
                    const filename = path.join(require('app-root-path').path, 'public', avatar);
                    fs.existsSync(filename) && fs.unlinkSync(filename);
                }
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `Missing information of new` });
                return res.redirect(`/admin/${req.params.type}/create`);
            }
            let news = mongoose.model('news')({
                title, author, tags, keywords, content, avatar,
                _id: change_alias(title),
                points: [0]
            });
            let exist = await mongoose.model('news').findById(news);
            if (exist) news._id += `-${Date.now()}`;
            await news.save();

            req.session.messages || (req.session.messages = []);
            req.session.messages.push({
                type: 'success',
                message: `Create <strong>${req.body.title || req.body.name}</strong> successfully!`
            });
            res.redirect(`/admin/${req.params.type}/create`);
        } else if (type === 'websites') {
            let {
                name = '',
                author = '',
                country = '',
                field = '',
                trend = '',
                color = '',
                price,
                numOfCols,
                postTitle = '',
                postAuthor = '',
                content = '',
                completeDates,
                images = []
            } = req.body;

            [name, author, country, field, trend, color, postTitle, postAuthor, content] =
                [name, author, country, field, trend, color, postTitle, postAuthor, content].map(x => x.trim());
            if (Number.isNaN(Number(price)) || Number.isNaN(Number(numOfCols))) {
                images.map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `Number of columns and price must be number` });
                return res.redirect(`/admin/${req.params.type}/create`);
            }
            if (Number(price) < 0 || Number(numOfCols) < 1) {
                images.map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `Number of columns and price is invalid` });
                return res.redirect(`/admin/${req.params.type}/create`);
            }
            if (Number.isNaN(Number(completeDates))) {
                images.map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `"Number of date to complete" must be number` });
                return res.redirect(`/admin/${req.params.type}/create`);
            }
            if (Number(completeDates) < 1) {
                images.map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `"Number of date to complete" must be greater than 0` });
                return res.redirect(`/admin/${req.params.type}/create`);
            }
            if (!country || !field || !trend || !color || !name || !author || !postTitle || !content) {
                images.map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `Missing information of website` });
                return res.redirect(`/admin/${req.params.type}/create`);
            }
            if (name.length < 6) {
                images.map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `Name of website must at least 6 characters length` });
                return res.redirect(`/admin/${req.params.type}/create`);
            }
            if (images.length < NUM_OF_IMAGES) {
                images.map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `We need ${NUM_OF_IMAGES} images of website` });
                return res.redirect(`/admin/${req.params.type}/create`);
            } else if (images.length > NUM_OF_IMAGES) {
                let remainImage = images.slice(NUM_OF_IMAGES).map(url => path.join(require('app-root-path').path, 'public', url));
                images = images.slice(0, NUM_OF_IMAGES);
                remainImage.forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'info', message: `We can only save ${NUM_OF_IMAGES} images, any more will be removed.` });
            }

            [country, field, trend, color] = [country, field, trend, color].map(x => x.toLowerCase());
            const postId = mongoose.Types.ObjectId();
            const website = mongoose.model('Websites')({
                name, author, images, field, country, color, trend, price, numOfCols, completeDates,
                _id: change_alias(name),
                details: postId
            });
            const post = mongoose.model('posts')({
                _id: postId,
                title: req.body.postTitle,
                author: req.body.postAuthor ? req.body.postAuthor : req.body.author,
                content: req.body.content
            });
            let exist = await mongoose.model('Websites').findById(website);
            if (exist) website._id += `-${Date.now()}`;

            const [countryCount, colorCount, fieldCount, trendCount] = await Promise.all([
                mongoose.model('Websites').find({ 'country': country }).countDocuments(),
                mongoose.model('Websites').find({ 'color': color }).countDocuments(),
                mongoose.model('Websites').find({ 'field': field }).countDocuments(),
                mongoose.model('Websites').find({ 'trend': trend }).countDocuments(),
            ]);

            await Promise.all([
                mongoose.model('Countries').findOneAndUpdate(
                    { name: country },
                    { $set: { $inc: { quantity: 1 } }, $setOnInsert: { quantity: countryCount + 1, name: country, _id: change_alias(country) + `-${Date.now()}` } },
                    { upsert: true }),
                mongoose.model('colors').findOneAndUpdate(
                    { name: color },
                    { $set: { $inc: { quantity: 1 } }, $setOnInsert: { quantity: colorCount + 1, name: color, _id: change_alias(color) + `-${Date.now()}` } },
                    { upsert: true }),
                mongoose.model('fields').findOneAndUpdate(
                    { name: field },
                    { $set: { $inc: { quantity: 1 } }, $setOnInsert: { quantity: fieldCount + 1, name: field, _id: change_alias(field) + `-${Date.now()}` } },
                    { upsert: true }),
                mongoose.model('trends').findOneAndUpdate(
                    { name: trend },
                    { $set: { $inc: { quantity: 1 } }, $setOnInsert: { quantity: trendCount + 1, name: trend, _id: change_alias(trend) + `-${Date.now()}` } },
                    { upsert: true }),
                website.save(),
                post.save()
            ]);

            req.session.messages || (req.session.messages = []);
            req.session.messages.push({
                type: 'success',
                message: `Create <strong>${req.body.title || req.body.name}</strong> successfully!`
            });
            res.redirect(`/admin/${req.params.type}/create`);
        } else res.redirect('/admin');
    } catch (err) {
        next(err);
    }
}, (err, req, res, next) => {
    if (req.params.type && ['websites', 'news'].includes(req.params.type)) {
        req.session.messages || (req.session.messages = []);
        req.session.messages.push({
            type: 'danger',
            message: err.message ? err.message : err
        });
        return res.redirect(`/admin/${req.params.type}/create`);
    }
    next(err);
});

router.get('/:type/modify/:id', async (req, res, next) => {
    try {
        const type = req.params.type;
        const id = req.params.id;

        if (type === 'news') {
            const News = mongoose.model('news');
            const new_instance = await News.findById(id).lean();
            if (new_instance) {
                //res.json(new_instance);
                new_instance.tags = new_instance.tags.join(',');
                new_instance.keywords = new_instance.keywords.join(',');
                const message = req.session.messages || [];
                req.session.messages = null;

                res.render('admin-modify', { instance: new_instance, type, csrfToken: req.csrfToken(), message: message, haveMessage: message.length > 0 });
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
                const message = req.session.messages || [];
                req.session.messages = null;

                res.render('admin-modify', { instance: website_instance, type, csrfToken: req.csrfToken(), message: message, haveMessage: message.length > 0 });
                //res.json(website_instance);
            } else {
                const error = new Error('Not Found');
                error.status = 404;
                next(error);
            }
        } else res.redirect('/admin');
    } catch (err) {
        next(err);
    }
});

router.post('/:type/modify/:id', (req, res, next) => {
    const type = req.params.type;
    if (type === 'news') upload.single('avatar')(req, res, next);
    else if (type === 'websites') {
        updateImageWebsite.fields([
            { name: 'images_0' },
            { name: 'images_1' },
            { name: 'images_2' },
            { name: 'images_3' }
        ])(req, res, next);
    } else {
        req.session.messages || (res.session.messages = []);
        req.session.messages.push({ type: 'danger', message: 'Invalid type of products' });
        res.redirect(`/admin/${req.params.type}/modify/${req.params.id}`);
    }
}, async (req, res, next) => {
    try {
        const type = req.params.type;
        const id = (req.params.id || '').trim(); // Old ID --- _id: new ID
        if (type === 'news') {
            let { _id = '', title = '', author = '', tags = '', keywords = '', content = '', avatar } = req.body;
            [_id, title, author, content] = [_id, title, author, content].map(val => val.trim());
            _id = change_alias(_id);

            tags = tags.split(',').filter(tag => tag.trim()).map(tag => tag.trim().toLowerCase());
            keywords = keywords.split(',').filter(keyword => keyword.trim()).map(keyword => keyword.trim().toLowerCase());

            if (!_id || !id || !title || !author || !content) {
                if (avatar) {
                    const filename = path.join(require('app-root-path').path, 'public', avatar);
                    fs.existsSync(filename) && fs.unlinkSync(filename);
                }
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `Missing information of new` });
                if (!id) return res.redirect(`/admin`);
                return res.redirect(`/admin/${type}/modify/${id}`);
            }

            let exist = await mongoose.model('news').findById(_id); // new id is already exist or not?
            if (exist && id !== _id) {
                if (avatar) {
                    const filename = path.join(require('app-root-path').path, 'public', avatar);
                    fs.existsSync(filename) && fs.unlinkSync(filename);
                }
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `ID <strong>${_id}</strong> is alreadly existed` });
                return res.redirect(`/admin/${type}/modify/${id}`);
            }

            const update = { _id, title, author, tags, keywords, content };
            if (avatar) update.avatar = avatar;

            let oldInfo = await mongoose.model('news').findById(id).lean();
            let newInfo = mongoose.model('news')({ ...oldInfo, ...update });
            await mongoose.model('news').findByIdAndRemove(id);
            await newInfo.save();

            if (avatar && !oldInfo.avatar.includes('/images/news/no-image.jpg')) {
                const filename = path.join(require('app-root-path').path, 'public', oldInfo.avatar);
                fs.existsSync(filename) && fs.unlinkSync(filename);
            }

            req.session.messages || (req.session.messages = []);
            req.session.messages.push({
                type: 'success',
                message: `Update <strong>${req.body.title || req.body.name}</strong> successfully!`
            });
            res.redirect(`/admin/${type}/modify/${_id}`);
        } else if (type === 'websites') {
            let {
                _id = '',
                name = '',
                author = '',
                country = '',
                field = '',
                trend = '',
                color = '',
                price,
                numOfCols,
                postTitle = '',
                postAuthor = '',
                content = '',
                completeDates,
                images = {}
            } = req.body;

            [_id, name, author, country, field, trend, color, postTitle, postAuthor, content] =
                [_id, name, author, country, field, trend, color, postTitle, postAuthor, content].map(x => x.trim());
            _id = change_alias(_id);

            if (Number.isNaN(Number(price)) || Number.isNaN(Number(numOfCols))) {
                Object.values(images).map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `Number of columns and price must be number` });
                return res.redirect(`/admin/${type}/modify/${id}`);
            }
            if (Number(price) < 0 || Number(numOfCols) < 1) {
                Object.values(images).map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `Number of columns and price is invalid` });
                return res.redirect(`/admin/${type}/modify/${id}`);
            }
            if (Number.isNaN(Number(completeDates))) {
                Object.values(images).map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `"Number of date to complete" must be number` });
                return res.redirect(`/admin/${type}/modify/${id}`);
            }
            if (Number(completeDates) < 1) {
                Object.values(images).map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `"Number of date to complete" must be greater than 0` });
                return res.redirect(`/admin/${type}/modify/${id}`);
            }
            if (!_id || !country || !field || !trend || !color || !name || !author || !postTitle || !content) {
                Object.values(images).map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `Missing information of website` });
                return res.redirect(`/admin/${type}/modify/${id}`);
            }
            if (name.length < 6) {
                Object.values(images).map(url => path.join(require('app-root-path').path, 'public', url)).forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `Name of website must at least 6 characters length` });
                return res.redirect(`/admin/${type}/modify/${id}`);
            }
            [country, field, trend, color] = [country, field, trend, color].map(x => x.toLowerCase());

            let exist = await mongoose.model('Websites').findById(_id);
            if (exist && id !== _id) {
                if (Object.values(images).length)
                    Object.values(images)
                        .map(url => path.join(require('app-root-path').path, 'public', url))
                        .forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));
                req.session.messages || (req.session.messages = []);
                req.session.messages.push({ type: 'danger', message: `ID <strong>${_id}</strong> is alreadly existed` });
                return res.redirect(`/admin/${type}/modify/${id}`);
            }

            let update = { _id, name, author, field, country, color, price, numOfCols, trend, completeDates };
            let oldInfo = await mongoose.model('Websites').findById(id).lean();
            if (!oldInfo) return res.redirect(`/admin/${type}`);

            let newInfo = mongoose.model('Websites')({ ...oldInfo, ...update });
            Object.keys(images).map(key => {
                const new_url = images[key], change_index = Number(key.split('_')[1]);
                const old_url = path.join(require('app-root-path').path, 'public', oldInfo.images[change_index]);
                if (change_index < NUM_OF_IMAGES) {
                    newInfo.images[change_index] = new_url;
                    fs.existsSync(old_url) && fs.unlinkSync(old_url);
                }
            });

            await Promise.all([
                mongoose.model('posts').findByIdAndUpdate(newInfo.details, { title: postTitle, author: postAuthor, content: content }),
                mongoose.model('Countries').findOneAndUpdate(  // Update
                    { name: oldInfo.country, quantity: { $gte: 1 } },
                    { $inc: { quantity: -1 } }
                ),
                mongoose.model('colors').findOneAndUpdate(
                    { name: oldInfo.color, quantity: { $gte: 1 } },
                    { $inc: { quantity: -1 } }
                ),
                mongoose.model('trends').findOneAndUpdate(
                    { name: oldInfo.trend, quantity: { $gte: 1 } },
                    { $inc: { quantity: -1 } }
                )
                , mongoose.model('fields').findOneAndUpdate(
                    { name: oldInfo.field, quantity: { $gte: 1 } },
                    { $inc: { quantity: -1 } }
                )
            ]);

            const [countryCount, colorCount, fieldCount, trendCount] = await Promise.all([
                mongoose.model('Websites').find({ 'country': newInfo.country }).countDocuments(),
                mongoose.model('Websites').find({ 'color': newInfo.color }).countDocuments(),
                mongoose.model('Websites').find({ 'field': newInfo.field }).countDocuments(),
                mongoose.model('Websites').find({ 'trend': newInfo.trend }).countDocuments(),
            ]);

            await Promise.all([
                newInfo.save(),
                mongoose.model('Websites').findByIdAndRemove(id),
                mongoose.model('Countries').findOneAndUpdate(
                    { name: newInfo.country },
                    { $set: { $inc: { quantity: 1 } }, $setOnInsert: { quantity: countryCount, name: newInfo.country, _id: change_alias(newInfo.country) + `-${Date.now()}` } },
                    { upsert: true }),
                mongoose.model('colors').findOneAndUpdate(
                    { name: newInfo.color },
                    { $set: { $inc: { quantity: 1 } }, $setOnInsert: { quantity: colorCount, name: newInfo.color, _id: change_alias(newInfo.color) + `-${Date.now()}` } },
                    { upsert: true }),
                mongoose.model('fields').findOneAndUpdate(
                    { name: newInfo.field },
                    { $set: { $inc: { quantity: 1 } }, $setOnInsert: { quantity: fieldCount, name: newInfo.field, _id: change_alias(newInfo.field) + `-${Date.now()}` } },
                    { upsert: true }),
                mongoose.model('trends').findOneAndUpdate(
                    { name: newInfo.trend },
                    { $set: { $inc: { quantity: 1 } }, $setOnInsert: { quantity: trendCount, name: newInfo.trend, _id: change_alias(newInfo.trend) + `-${Date.now()}` } },
                    { upsert: true }),
            ])

            req.session.messages || (req.session.messages = []);
            req.session.messages.push({
                type: 'success',
                message: `Update <strong>${req.body.title || req.body.name}</strong> successfully!`
            });
            res.redirect(`/admin/${type}/modify/${_id}`);
        } else res.redirect('/admin');
    } catch (err) {
        next(err);
    }
}, (err, req, res, next) => {
    if (req.params.type && ['websites', 'news'].includes(req.params.type)) {
        req.session.messages || (req.session.messages = []);
        req.session.messages.push({
            type: 'danger',
            message: err.message ? err.message : err
        });
        return res.redirect(`/admin/${req.params.type}/modify/${req.params.id}`);
    }
    next(err);
});

router.post('/:type/delete', async (req, res, next) => {
    try {
        const type = req.params.type;
        const ids = (req.body.ids || []).map(id => id.trim()).filter(id => id); // array of ids
        if (type === 'news') {
            const listDelete = await Promise.all(ids.map(id => mongoose.model('news').findByIdAndRemove(id)));
            // *** Delete avatar
            listDelete.map(new_instance => {
                if (!new_instance.avatar.includes('/images/news/no-image.jpg')) {
                    const filename = path.join(require('app-root-path').path, 'public', new_instance.avatar);
                    fs.existsSync(filename) && fs.unlinkSync(filename);
                }
            });
            res.json({ message: 'Removed news successfully', countDelete: listDelete.length });
        } else if (type === 'websites') {
            const listDelete = await Promise.all(ids.map(id => mongoose.model('Websites').findByIdAndRemove(id)));
            await Promise.all(listDelete.map(async (website) => {
                // *** Delete Images
                website.images
                    .map(url => path.join(require('app-root-path').path, 'public', url))
                    .forEach(filename => fs.existsSync(filename) && fs.unlinkSync(filename));

                await Promise.all([
                    mongoose.model('posts').findByIdAndRemove(website.details), // Detete post
                    mongoose.model('Countries').findOneAndUpdate(  // Update
                        { name: website.country, quantity: { $gte: 1 } },
                        { $inc: { quantity: -1 } }
                    ),
                    mongoose.model('colors').findOneAndUpdate(
                        { name: website.color, quantity: { $gte: 1 } },
                        { $inc: { quantity: -1 } }
                    ),
                    mongoose.model('trends').findOneAndUpdate(
                        { name: website.trend, quantity: { $gte: 1 } },
                        { $inc: { quantity: -1 } }
                    )
                    , mongoose.model('fields').findOneAndUpdate(
                        { name: website.field, quantity: { $gte: 1 } },
                        { $inc: { quantity: -1 } }
                    )
                ])
            }));
            res.json({ message: 'Removed websites successfully', countDelete: listDelete.length });
        } else res.redirect('/admin');
    } catch (err) {
        next(err)
    }
});

router.post('/find/:type', async (req, res, next) => {
    try {
        const findAccept = ['Countries', 'colors', 'trends', 'fields'];
        if (findAccept.includes(req.params.type)) {
            const name = (req.body.value || '').toLowerCase().trim();
            if (name === '') res.json({ data: [] });
            const data = await mongoose.model(req.params.type).find({ name: new RegExp(name, 'gi') }).limit(20);
            res.json({ data: data });
        } else next(new Error("Invalid type of params"));
    } catch (err) {
        next(new Error(err.message));
    }
});

module.exports = router;