var express = require('express');

module.exports = function(passport) {

    var router = express.Router();

    /* GET home page. */
    router.get('/', function (req, res, next) {
        res.render('index', {title: 'Express'});
    });

    router.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.send({ 'authenticated': false, 'error': "Incorrect username or password"}); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.send(user);
            });
        })(req, res, next);
    });

    router.post('/signup', function(req, res, next) {
        passport.authenticate('local-signup', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.send({ 'authenticated': false, 'error': "Could not sign up"}); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.send(user);
            });
        })(req, res, next);
    });

    router.post('/auth',passport.authenticate('authKey', { failureRedirect: '/unauthorized' }),
        function (req,res,next) {
            res.json({ message: "Authenticated!" });
        }
    );

    router.get('/auth',passport.authenticate('authKey', { failureRedirect: '/unauthorized' }),
        function (req,res,next) {
            res.json({ message: "Authenticated!" });
        }
    );

    router.get('/login', function (req,res,next) {
        res.send('login page');
    });

    router.get('/unauthorized', function(req,res,next) {
        res.status(401);
        res.json({ message: "Unauthorized" });
    });

    return router;
};;

//module.exports = router;