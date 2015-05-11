var express = require('express');
var router = express();
var User;
var Race;
var Location;

function resetData(req, res, next) {
    
	
	
	
	return res.end("Database is gereset.");
};

router.route('/')
    .get(resetData)

// Export
module.exports = function (mongoose, errCallback, roles) {
	User = mongoose.model('User');
    Race = mongoose.model('Race');
    Location = mongoose.model('Location');
    return router;
};
