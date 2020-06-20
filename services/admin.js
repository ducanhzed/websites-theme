const mongoose = require('mongoose');
var path = require('path');
var change_alias = require('../services/change_alias');
const User = require('../models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

class AdminService {
    constructor() { }

    passportConfig() {
        passport.serializeUser(function (user, done) {
            done(null, user.id);
        });

        passport.deserializeUser(function (id, done) {
            User.findById(id, done);
        });

        passport.use('local.signin', new LocalStrategy(
            {
                usernameField: 'name',
                passwordField: 'password',
            },
            function (name, password, done) {
                // Validate Input
                const validateName = /^[A-Za-z0-9@_\.]+$/;
                if (!validateName.test(name)) return done(null, false, { message: 'No user found' });
                if (password.length < 6 || password.length > 20) return done(null, false, { message: 'No user found' });


                // Find User 
                User.findOne({ name: name }, function (err, user) {
                    if (err) return done(err);
                    if (!user) return done(null, false, { message: 'No user found' });
                    if (!user.validPassword(password))
                        return done(null, false, { message: 'No user found' });
                    return done(null, user);
                });
            }
        ));
    }

    multerConfig() {
        return {
            destination: (req, file, cb) => {
                const accept = ['news', 'websites'];
                if (accept.includes(req.params.type)) {
                    cb(null, path.join(require('app-root-path').path, 'public', 'images', req.params.type));
                } else cb('Invalid type of product.');
            },
            filename: (req, file, cb) => {
                let acceptMimeType = ["image/png", "image/jpeg"];
                if (acceptMimeType.indexOf(file.mimetype) === -1) {
                    let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
                    return cb(errorMess);
                }
                let type = file.originalname.split('.').slice(-1)[0];
                if (req.params.type === 'news') {
                    let filename = `${change_alias(req.body.title)}-${Date.now()}.${type}`;
                    req.body.avatar = `/images/${req.params.type}/${filename}`;
                    cb(null, filename);
                } else if (req.params.type === 'websites') {
                    let filename = `${change_alias(req.body.name)}-${Date.now()}.${type}`;
                    if (!req.body.images) req.body.images = [];
                    req.body.images.push(`/images/${req.params.type}/${filename}`);
                    cb(null, filename);
                } else cb('Invalid type of product.');
            }
        }
    }

    multerConfigUpdateWebsite() {
        return {
            destination: this.multerConfig().destination,
            filename: (req, file, cb) => {
                let acceptMimeType = ["image/png", "image/jpeg"];
                if (acceptMimeType.indexOf(file.mimetype) === -1) {
                    let errorMess = `The file <strong>${file.originalname}</strong> is invalid. Only allowed to upload image jpeg or png.`;
                    return cb(errorMess);
                }
                let type = file.originalname.split('.').slice(-1)[0];
                let filename = `${change_alias(req.body.name)}-${Date.now()}.${type}`;
                if (!req.body.images) req.body.images = {};
                req.body.images[file.fieldname] = `/images/${req.params.type}/${filename}`;
                cb(null, filename);
            }
        }
    }

    needLogin(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            req.session.oldUrl = req.originalUrl;
            res.redirect('/admin/login');
        }
    }

    needNotLogin(req, res, next) {
        if (!req.isAuthenticated()) {
            next();
        } else res.redirect('/admin');
    }
}

module.exports = AdminService;