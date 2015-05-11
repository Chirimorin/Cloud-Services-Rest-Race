var express = require('express');
var router = express();
var User;
var Race;
var Location;

function resetData(req, res, next) {
    User.remove().exec();
 	Race.remove().exec();
	Location.remove().exec();
	
	var admin = new User();
	admin.logins.local.email = "admin@admin.nl";
    admin.logins.local.password = admin.generateHash("admin");
	admin.roles.push("Admin");
	admin.save();
	
	var user1 = new User();
	user1.logins.local.email = "test@test.nl";
    user1.logins.local.password = user1.generateHash("test");
	user1.save();
	
	var user2 = new User();
	user2.logins.local.email = "test2@test.nl";
    user2.logins.local.password = user2.generateHash("test");
	user2.save();
	
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
