/*

 */

var express = require('express');
var router = express();
var handleError;

/* GET users listing. */
function getUsers(req, res, next) {
    console.log("testUsers");
    res.send('respond with a resource');
}



module.exports = function (mongoose, passport, role, errCallback){
    console.log("Loading users route...");

    User = mongoose.model('User');
    handleError = errCallback;

    router.route('/')
        .get(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), role.can('view user list'), getUsers);

    return router;
};
