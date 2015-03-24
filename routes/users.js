/*

 */

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});


module.exports = function (mongoose, passport, errCallback){
    User = mongoose.model('User');
    handleError = errCallback;
    return router;
};
