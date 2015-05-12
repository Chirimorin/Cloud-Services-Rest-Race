var express = require('express');
var router = express();
var User;
var Race;
var Location;

function resetData(req, res, next) {
    
	// Database leeg maken
	User.remove().exec();
 	Race.remove().exec();
	Location.remove().exec();
	
	// Users toevoegen
	var admin = new User();
	admin._id = mongoose.Types.ObjectId("5edd40c86762e0fb12000000");
	admin.logins.local.email = "admin@admin.nl";
    admin.logins.local.password = admin.generateHash("admin");
	admin.roles.push("admin");
	admin.authKey = "admin";
	admin.save();
	
	var user1 = new User();
	user1._id = mongoose.Types.ObjectId("5edd40c86762e0fb12000001");
	user1.logins.local.email = "test@test.nl";
    user1.logins.local.password = user1.generateHash("test");
	user1.authKey = "test";
	user1.save();
	
	var user2 = new User();
	user2._id = mongoose.Types.ObjectId("5edd40c86762e0fb12000002");
	user2.logins.local.email = "test2@test.nl";
    user2.logins.local.password = user2.generateHash("test");
	user2.authKey = "test2";
	user2.save();
	
	var user3 = new User();
	user3._id = mongoose.Types.ObjectId("5edd40c86762e0fb12000003");
	user3.logins.local.email = "test3@test.nl";
    user3.logins.local.password = user2.generateHash("test");
	user3.authKey = "test3";
	user3.save();
	
	var user4 = new User();
	user4._id = mongoose.Types.ObjectId("5edd40c86762e0fb12000004");
	user4.logins.local.email = "test4@test.nl";
    user4.logins.local.password = user2.generateHash("test");
	user4.authKey = "test4";
	user4.save();
	
	// Locations toevoegen
	var location1 = new Location();
	location1._id = mongoose.Types.ObjectId("6edd40c86762e0fb12000001");
	location1.name = "Location 1";
	location1.lat = 1.0;
	location1.long = 2.0;
	location1.distance = 3.0;
	location1.save();
	
	var location2 = new Location();
	location2._id = mongoose.Types.ObjectId("6edd40c86762e0fb12000002");
	location2.name = "Location 2";
	location2.lat = 1.0;
	location2.long = 2.0;
	location2.distance = 3.0;
	location2.save();
	
	// Races toevoegen
	var race1 = new Race();
	race1._id = mongoose.Types.ObjectId('4edd40c86762e0fb12000001');
	race1.name = "Race 1";
	race1.owners.push(user1._id);
	race1.owners.push(user4._id);
	race1.participants.push(user2._id);
	race1.hasSpecificOrder = false;
	race1.locations.push({location: location1._id});
	race1.locations.push({location: location2._id});
	race1.startTime = new Date(2015, 5, 11, 20, 0, 0, 0);
	race1.endTime = new Date(2015, 5, 12, 30, 0, 0);
	race1.private = false;
	race1.save();
	
	var race2 = new Race();
	race2._id = mongoose.Types.ObjectId('4edd40c86762e0fb12000002');
	race2.name = "Race 2";
	race2.owners.push(user1._id);
	race2.owners.push(user4._id);
	race2.participants.push(user2._id);
	race2.hasSpecificOrder = false;
	race2.locations.push({location: location1._id});
	race2.locations.push({location: location2._id});
	race2.startTime = new Date(2015, 5, 11, 20, 0, 0, 0);
	race2.endTime = new Date(2015, 5, 12, 30, 0, 0);
	race2.private = false;
	race2.save();
	
	var race3 = new Race();
	race3._id = mongoose.Types.ObjectId('4edd40c86762e0fb12000003');
	race3.name = "Race 3";
	race3.owners.push(user1._id);
	race3.owners.push(user4._id);
	race3.participants.push(user2._id);
	race3.hasSpecificOrder = false;
	race3.locations.push({location: location1._id});
	race3.locations.push({location: location2._id});
	race3.startTime = new Date(2015, 5, 11, 20, 0, 0, 0);
	race3.endTime = new Date(2015, 5, 12, 30, 0, 0);
	race3.private = false;
	race3.save();
	
	var race4 = new Race();
	race4._id = mongoose.Types.ObjectId('4edd40c86762e0fb12000004');
	race4.name = "Race 4";
	race4.owners.push(user1._id);
	race4.owners.push(user4._id);
	race4.participants.push(user2._id);
	race4.hasSpecificOrder = false;
	race4.locations.push({location: location1._id});
	race4.locations.push({location: location2._id});
	race4.startTime = new Date(2015, 5, 11, 20, 0, 0, 0);
	race4.endTime = new Date(2015, 5, 12, 30, 0, 0);
	race4.private = false;
	race4.save();
	
	var race5 = new Race();
	race5._id = mongoose.Types.ObjectId('4edd40c86762e0fb12000005');
	race5.name = "Race 5";
	race5.owners.push(user1._id);
	race5.owners.push(user4._id);
	race5.participants.push(user2._id);
	race5.hasSpecificOrder = false;
	race5.locations.push({location: location1._id});
	race5.locations.push({location: location2._id});
	race5.startTime = new Date(2015, 5, 11, 20, 0, 0, 0);
	race5.endTime = new Date(2015, 5, 12, 30, 0, 0);
	race5.private = false;
	race5.save();
	
	return res.end("Database is gereset.");
};

router.route('/')
    .get(resetData)

// Export
module.exports = function (mongoose) {
	this.mongoose = mongoose;
	User = mongoose.model('User');
    Race = mongoose.model('Race');
    Location = mongoose.model('Location');
    return router;
};
