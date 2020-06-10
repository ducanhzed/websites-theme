const mongoose = require('mongoose');
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