var express = require('express');
var _passport;

function getHome(req, res, next) {
    res.render('index', {title: 'Express'});
};

function getLogin(req, res, next) {
    if (req.accepts('text/html'))
        return res.render('login', {message: req.flash('loginMessage')});
    else
        return res.json({message: req.flash('loginMessage')});
}

function postLogin(req, res, next) {
    _passport.authenticate('local-login', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/login');
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            if (req.accepts('text/html'))
                return res.redirect('/profile');
            else
                return res.json(user);
        });
    })(req, res, next);
}

function getSignup(req, res, next) {
    if (req.accepts('text/html'))
        return res.render('registreren', {message: req.flash('signupMessage')});
    else
        return res.json({message: req.flash('signupMessage')});
}

function postSignup(req, res, next) {
    _passport.authenticate('local-signup', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/signup');
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            if (req.accepts('text/html'))
                return res.redirect('/profile');
            else
                return res.json(user);
        });
    })(req, res, next);
}

function getProfile(req, res, next) {
    if (req.user == null)
        return res.redirect('/login');
    else
        return res.render('profile', {user: req.user});
}

function logout(req, res, next) {
    if (req.user != null) {
        // Remove the authKey from te user
        var user = req.user;
        user.authKey = null;

        // save the user
        user.save(function (err) {
            if (err)
                throw err;
        });

        // Log the user out using passport
        req.logout();
    }

    return res.redirect('/');
}

function unauthorized(req, res, next) {
    res.status(401);
    res.json({message: "Unauthorized"});
}

module.exports = function (passport, errCallback) {
    _passport = passport;
    var router = express();

    handleError = errCallback;

    router.route('/')
        .get(getHome);

    router.route('/login')
        .get(getLogin)
        .post(postLogin);

    router.route('/signup')
        .get(getSignup)
        .post(postSignup);

    router.route('/profile')
        .get(getProfile);

    router.route('/logout')
        .get(logout)
        .post(logout);

    router.route('/unauthorized')
        .get(unauthorized)
        .post(unauthorized);

    return router;
};
;

//module.exports = router;