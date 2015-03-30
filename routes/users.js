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



module.exports = function (mongoose, passport, role, errCallback){
    console.log("Loading users route...");

    User = mongoose.model('User');
    handleError = errCallback;

    router.route('/')
        .get(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), role.can('view user list'), getUsers);

    return router;
};
