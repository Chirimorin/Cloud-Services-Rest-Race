var express = require('express');
var _passport;

function getHome(req,res,next) {
    res.render('index', {title: 'Express'});
};

function getLogin(req,res,next) {
    res.send('login page');
}

function postLogin(req,res,next) {
    _passport.authenticate('local-login', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.send({ 'authenticated': false, 'error': "Incorrect username or password"}); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            if (req.accepts('application/json'))
                return res.json(user);
            else
                return res.send('blah');
        });
    })(req, res, next);
}

function getSignup(req,res,next) {
    return res.render('registreren');
}

function postSignup(req,res,next) {
    _passport.authenticate('local-signup', function(err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.send({ 'authenticated': false, 'error': "Could not sign up"}); }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            if (req.accepts('application/json'))
                return res.json(user);
            else
                return res.send('blah');
        });
    })(req, res, next);
}

function logout(res,req,next){
    var user = req.user;
    user.authKey = null;

    // save the user
    user.save(function(err) {
        if (err)
            throw err;
    });

    res.json(user);
}

function unauthorized(res,req,next){
    res.status(401);
    res.json({ message: "Unauthorized" });
}

module.exports = function(passport, errCallback) {
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

    router.route('/logout')
        .get(passport.authenticate('authKey', { failureRedirect: '/' }), logout)
        .post(passport.authenticate('authKey', { failureRedirect: '/' }), logout);

    router.route('/unauthorized')
        .get(unauthorized)
        .post(unauthorized);

    return router;
};;

//module.exports = router;