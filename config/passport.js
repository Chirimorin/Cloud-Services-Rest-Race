/**
 * Created by Thomas on 17-3-2015.
 */

// config/passport.js

// load all the things we need
var LocalStrategy       = require('passport-local').Strategy;
var LocalAPIKeyStrategy = require('passport-localapikey').Strategy;

// load up the user model
var User            = require('../models/user');

var uuid = require('node-uuid');

function getUUID() {
    var newUuid = uuid.v4();

    function uuidExists(value) {
        User.findOne({'authKey': newUuid}, function (err, foundUser) {
            /* istanbul ignore if  */
            if (foundUser) {
                return true;
            } else {
                return false;
            }
        });
    }

    /* istanbul ignore next  */
    while (uuidExists(newUuid)) {
        newUuid = uuid.v4();
    }

    return newUuid;
}

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    /* istanbul ignore next  */
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {

            // asynchronous
            // User.findOne wont fire unless data is sent back
            process.nextTick(function() {

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({ 'logins.local.email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    /* istanbul ignore if  */
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'Er bestaat al een account met dat e-mail adres.'));
                    } else {

                        // if there is no user with that email
                        // create the user
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.logins.local.email    = email;
                        newUser.logins.local.password = newUser.generateHash(password);

                        newUser.authKey = getUUID();

                        // save the user
                        newUser.save(function(err) {
                            /* istanbul ignore if  */
                            if (err) {
                                if (err.errors['logins.local.email']) {
                                    return done(null, false, req.flash('signupMessage', String(err.errors['logins.local.email'])));
                                }
                                if (err.errors['logins.local.password']) {
                                    return done(null, false, req.flash('signupMessage', String(err.errors['logins.local.password'])));
                                }
                                return done(null, false, req.flash('signupMessage', 'Er is iets niet goed gegaan bij het registreren. Probeer het later nog eens.'));

                            }

                            return done(null, newUser);
                        });
                    }

                });

            });

        }));
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'logins.local.email' :  email }, function(err, user) {
                // if there are any errors, return the error before anything else
                /* istanbul ignore if  */
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user || !user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Incorrecte gebruikersnaam of wachtwoord.')); // req.flash is the way to set flashdata using connect-flash

                // all is well, return successful user

                if (user.authKey == null) {
                    user.authKey = getUUID();
                    user.save(function(err) {
                        /* istanbul ignore if  */
                        if (err)
                            throw err;
                    })
                }

                return done(null, user);
            });

        }));

    passport.use('authKey', new LocalAPIKeyStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, authKey, done) {

            User.findOne({ authKey: authKey }, function (err, user) {
                /* istanbul ignore if  */
                if (err) { return done(err); }
                if (!user) {
                    /* istanbul ignore if  */
                    if (req.user) {
                        return done (null, req.user);
                    }
                    return done(null, false);
                }
                return done(null, user);
            });
        }
    ));
};
