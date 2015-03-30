/*

 */

var express = require('express');
var router = express();
var handleError;
var User;

/* GET users listing. */
function getUsers(req, res, next) {
    User.find({}, function(err, users){
        if(err){ return handleError(req, res, 500, err); }
        else {
            res.status(200);
            res.json(users);
        }
    });
}

function setNickname(req,res,next) {
    var user = req.user;
    user.nickname = req.body.nickname;

    user.save(function(err, user){
        if(err){ return handleError(req, res, 500, err); }
        else {
            res.status(200);
            res.json({ status: 200, message: "Nickname succesvol aangepast."});
        }
    });
}

function setUserNickname(req,res,next) {
    User.findByIdAndUpdate(req.params.id, {$set: {nickname: req.body.nickname}}, function (err, user){
        if(err){ return handleError(req, res, 500, err); }
        else {
            res.status(200);
            res.json({ status: 200, message: "Nickname succesvol aangepast."});
        }
    });
}

module.exports = function (mongoose, passport, role, errCallback){
    console.log("Loading users route...");

    User = mongoose.model('User');
    handleError = errCallback;

    router.route('/')
        .get(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), role.can('view user list'), getUsers);

    router.route('/nickname')
        .put(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), setNickname);

    router.route('/:id/nickname')
        .put(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), role.can('edit users'), setUserNickname);

    return router;
};
