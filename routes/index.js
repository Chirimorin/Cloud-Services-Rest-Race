var express = require('express');

module.exports = function(passport) {

    var router = express.Router();

    /* GET home page. */
    router.get('/', function (req, res, next) {
        res.render('index', {title: 'Express'});
    });

    //router.post('/login', passport.authenticate('local-login', function(err, user, info) {
    //    if (err) { return next(err); }
    //    if (!user) { return res.redirect('/login'); }
    //    req.logIn(user, function(err) {
    //        if (err) { return next(err); }
    //        return res.redirect('/users/' + user.username);
    //    });
    //}));

    router.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.send({ 'authenticated': false, 'error': "Incorrect username or password"}); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                return res.redirect('/users/' + user.username);
            });
        })(req, res, next);
    });

    router.get('/login', function (req,res,next) {
        res.send('login page');
    });

    return router;
};;

//module.exports = router;