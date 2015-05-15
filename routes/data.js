var express = require('express');
var router = express();
var User;
var Race;
var Location;

function resetData(req, res, next) {
    // Pluginloze manier om op alle async tasks te wachten.
    var numresets = 3;
    var numtasks = 20;
    var errors = 0;

    // Callback voor elke reset functie
    function resetcallback(err) {
        numresets--;
        if (err) {
            errors++;
        }

        if (numresets == 0) {
            // Alle resets klaar. Start met data vullen.
            addAllData();
        }

    }
    function addcallback(err) {
        numtasks--;
        if (err) {
            errors++;
        }

        if (numtasks == 0) {
            if (errors != 0) {
                res.status(500);
            }
            res.end("Data reset complete");
        }
    }
    
	// Database leeg maken
	User.remove().exec(resetcallback);
 	Race.remove().exec(resetcallback);
	Location.remove().exec(resetcallback);

    function addAllData() {
        // Users toevoegen
        var admin = new User();
        admin._id = mongoose.Types.ObjectId("100000000000000000000001");
        admin.logins.local.email = "admin@admin.nl";
        admin.logins.local.password = admin.generateHash("admin");
        admin.roles.push("admin");
        admin.authKey = "admin";
        admin.save(addcallback);

        var user1 = new User();
        user1._id = mongoose.Types.ObjectId("100000000000000000000002");
        user1.logins.local.email = "test@test.nl";
        user1.logins.local.password = user1.generateHash("test");
        user1.authKey = "test";
        user1.save(addcallback);

        var user2 = new User();
        user2._id = mongoose.Types.ObjectId("100000000000000000000003");
        user2.logins.local.email = "test2@test.nl";
        user2.logins.local.password = user2.generateHash("test");
        user2.authKey = "test2";
        user2.save(addcallback);

        var user3 = new User();
        user3._id = mongoose.Types.ObjectId("100000000000000000000004");
        user3.logins.local.email = "test3@test.nl";
        user3.logins.local.password = user2.generateHash("test");
        user3.authKey = "test3";
        user3.save(addcallback);

        var user4 = new User();
        user4._id = mongoose.Types.ObjectId("100000000000000000000005");
        user4.logins.local.email = "test4@test.nl";
        user4.logins.local.password = user2.generateHash("test");
        user4.authKey = "test4";
        user4.save(addcallback);

        // Locations toevoegen
        var location1 = new Location();
        location1._id = mongoose.Types.ObjectId("200000000000000000000011");
        location1.name = "Location 1";
        location1.lat = 1.0;
        location1.long = 2.0;
        location1.distance = 3.0;
        location1.save(addcallback);

        var location2 = new Location();
        location2._id = mongoose.Types.ObjectId("200000000000000000000012");
        location2.name = "Location 2";
        location2.lat = 1.0;
        location2.long = 2.0;
        location2.distance = 3.0;
        location2.save(addcallback);

        var location3 = new Location();
        location3._id = mongoose.Types.ObjectId("200000000000000000000021");
        location3.name = "Location 1";
        location3.lat = 1.0;
        location3.long = 2.0;
        location3.distance = 3.0;
        location3.save(addcallback);

        var location4 = new Location();
        location4._id = mongoose.Types.ObjectId("200000000000000000000022");
        location4.name = "Location 2";
        location4.lat = 1.0;
        location4.long = 2.0;
        location4.distance = 3.0;
        location4.save(addcallback);

        var location5 = new Location();
        location5._id = mongoose.Types.ObjectId("200000000000000000000031");
        location5.name = "Location 1";
        location5.lat = 1.0;
        location5.long = 2.0;
        location5.distance = 3.0;
        location5.save(addcallback);

        var location6 = new Location();
        location6._id = mongoose.Types.ObjectId("200000000000000000000032");
        location6.name = "Location 2";
        location6.lat = 1.0;
        location6.long = 2.0;
        location6.distance = 3.0;
        location6.save(addcallback);

        var location7 = new Location();
        location7._id = mongoose.Types.ObjectId("200000000000000000000041");
        location7.name = "Location 1";
        location7.lat = 1.0;
        location7.long = 2.0;
        location7.distance = 3.0;
        location7.save(addcallback);

        var location8 = new Location();
        location8._id = mongoose.Types.ObjectId("200000000000000000000042");
        location8.name = "Location 2";
        location8.lat = 1.0;
        location8.long = 2.0;
        location8.distance = 3.0;
        location8.save(addcallback);

        var location9 = new Location();
        location9._id = mongoose.Types.ObjectId("200000000000000000000051");
        location9.name = "Location 1";
        location9.lat = 1.0;
        location9.long = 2.0;
        location9.distance = 3.0;
        location9.save(addcallback);

        var location10 = new Location();
        location10._id = mongoose.Types.ObjectId("200000000000000000000052");
        location10.name = "Location 2";
        location10.lat = 1.0;
        location10.long = 2.0;
        location10.distance = 3.0;
        location10.save(addcallback);

        // Races toevoegen
        var race1 = new Race();
        race1._id = mongoose.Types.ObjectId('300000000000000000000001');
        race1.name = "Race 1";
        race1.owners.push(user1._id);
        race1.owners.push(user4._id);
        race1.participants.push(user2._id);
        race1.hasSpecificOrder = false;
        race1.locations.push({_id: mongoose.Types.ObjectId('200000000000000000000011'), location: location1._id});
        race1.locations.push({_id: mongoose.Types.ObjectId('200000000000000000000012'), location: location2._id});
        race1.startTime = new Date(2015, 5, 11, 20, 0, 0, 0);
        race1.endTime = new Date(2015, 5, 12, 30, 0, 0);
        race1.private = false;
        race1.save(addcallback);

        var race2 = new Race();
        race2._id = mongoose.Types.ObjectId('300000000000000000000002');
        race2.name = "Race 2";
        race2.owners.push(user1._id);
        race2.owners.push(user4._id);
        race2.participants.push(user2._id);
        race2.hasSpecificOrder = false;
        race2.locations.push({_id: mongoose.Types.ObjectId('200000000000000000000021'), location: location1._id});
        race2.locations.push({_id: mongoose.Types.ObjectId('200000000000000000000022'), location: location2._id});
        race2.startTime = new Date(2015, 5, 11, 20, 0, 0, 0);
        race2.endTime = new Date(2015, 5, 12, 30, 0, 0);
        race2.private = false;
        race2.save(addcallback);

        var race3 = new Race();
        race3._id = mongoose.Types.ObjectId('300000000000000000000003');
        race3.name = "Race 3";
        race3.owners.push(user1._id);
        race3.owners.push(user4._id);
        race3.participants.push(user2._id);
        race3.hasSpecificOrder = false;
        race3.locations.push({_id: mongoose.Types.ObjectId('200000000000000000000031'), location: location1._id});
        race3.locations.push({_id: mongoose.Types.ObjectId('200000000000000000000032'), location: location2._id});
        race3.startTime = new Date(2015, 5, 11, 20, 0, 0, 0);
        race3.endTime = new Date(2015, 5, 12, 30, 0, 0);
        race3.private = false;
        race3.save(addcallback);

        var race4 = new Race();
        race4._id = mongoose.Types.ObjectId('300000000000000000000004');
        race4.name = "Race 4";
        race4.owners.push(user1._id);
        race4.owners.push(user4._id);
        race4.participants.push(user2._id);
        race4.hasSpecificOrder = false;
        race4.locations.push({_id: mongoose.Types.ObjectId('200000000000000000000041'), location: location1._id});
        race4.locations.push({_id: mongoose.Types.ObjectId('200000000000000000000042'), location: location2._id});
        race4.startTime = new Date(2015, 5, 11, 20, 0, 0, 0);
        race4.endTime = new Date(2015, 5, 12, 30, 0, 0);
        race4.private = false;
        race4.save(addcallback);

        var race5 = new Race();
        race5._id = mongoose.Types.ObjectId('300000000000000000000005');
        race5.name = "Race 5";
        race5.owners.push(user1._id);
        race5.owners.push(user4._id);
        race5.participants.push(user2._id);
        race5.hasSpecificOrder = false;
        race5.locations.push({_id: mongoose.Types.ObjectId('200000000000000000000051'), location: location1._id});
        race5.locations.push({_id: mongoose.Types.ObjectId('200000000000000000000052'), location: location2._id});
        race5.startTime = new Date(2015, 5, 11, 20, 0, 0, 0);
        race5.endTime = new Date(2015, 5, 12, 30, 0, 0);
        race5.private = false;
        race5.save(addcallback);
    }
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
