var passport = require('passport');
var express = require('express');
var router = express.Router();
var Race;
var User;
var Location;
var handleError;
var IO;

// Get all races
function getAllRaces(req, res) {

	if (req.accepts('text/html')) {
		return res.render('raceAanmaken');
	}
	else {

		var user = req.user;
		var type = req.query.type;
		var page = (req.query.page ? req.query.page : 1);
		var pageSize = (req.query.pageSize ? req.query.pageSize : 10);

		var query;
		if (type == "owner") {
			query = { owners: user._id };
		} else if (type == "participant") {
			query = { participants: user._id };
		} else {
			query = { private : false };
		}

		Race.find(query, '', { "skip": ((page-1) * pageSize), "limit": pageSize})
            .populate('owners')
            .populate('participants')
            .populate("locations.location")
            .exec(function(err, races) {
			if (err) {
				return handleError(req,res,500,err);
			}
			else {
				res.status(200);
				return res.json(races);
			}
		});

	}

}

// Get race by ID
function getRaceByID(req, res) {
    Race.findById(req.params.id)
        .populate("owners")
        .populate("participants")
        .populate("locations.location")
        .exec(function (err, race) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            // Map all location Ids that are part of this race.
            var locationIds = race.locations.map(function(e) { return e.location._id });

            // Loop through every participant to check visitedLocations
            for (i = 0; i < race.participants.length; i++) {
                var visitedLocations = race.participants[i].visitedLocations;

                // Loop through every visited location to check if it exists in the race.
                // Looping backwards so removals don't cause skips and index out of bounds problems.
                for (j = visitedLocations.length -1; j >= 0; j--) {
                    var id = visitedLocations[j].location;

                    // indexOf always returns -1, even if the 2 values are equal. Looping instead.
                    var found = false;
                    for (k = 0; k < locationIds.length && !found; k++) {
                        if (locationIds[k] == id) {
                            found = true;
                        }
                    }

                    // If the location was not found, remove it from the user array. This is safe due to the backwards looping of visitedLocations
                    if (!found) {
                        race.participants[i].visitedLocations.splice(j, 1);
                    }

                }
            }

            res.status(200);
            if (req.accepts('text/html'))
                return res.render('race', { "race": race });
            else
                return res.json(race);
        }
    });
}

// Add race
function addRace(req, res) {
    var race = new Race({
        name: req.body.name,
        hasSpecificOrder: req.body.hasSpecificOrder,
        startTime: req.body.startTime,
        private: req.body.private
    });
    race.owners.push(req.user._id);
    typeof req.body.endTime != "undefined" ? race["endTime"] = req.body.endTime : race["endTime"] = null;

    race.save(function (err, race) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            res.status(201);
			
			if (req.accepts('text/html')) {
				return res.render('profile');
			}
			else {
				res.json(race);
			}
        }
    });
}

// Update race by ID
function updateRaceByID(req, res) {
    var endTime;
    typeof req.body.endTime != "undefined" ? endTime = req.body.endTime : endTime = null;

    Race.findById(req.params.id, function (err, race) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            if (!race) {
                res.status(404);
                res.json({status: 404, message: "Race niet gevonden"});
            }
            else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            }
            else {
                race.name = req.body.name;
                race.hasSpecificOrder = req.body.hasSpecificOrder;
                race.startTime = req.body.startTime;
                race.endTime = endTime;
                race.private = req.body.private;
                race.save(function (err, race) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }
                });
                res.status(200);
                res.json(race);
            }
        }
    });
}

// Delete race by ID
function deleteRaceByID(req, res) {
    Race.findById(req.params.id, function (err, race) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            if (!race) {
                res.status(404);
                res.json({status: 404, message: "Race niet gevonden"});
            }
            else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            }
            else {
                race.remove();
                res.status(200);
                res.json(race);
            }
        }
    });
}

// Add owner to a race
function addOwner(req, res) {
    Race.findById(req.params.id, function (err, race) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            if (!race) {
                res.status(404);
                res.json({status: 404, message: "Race niet gevonden"});
            }
            else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            }
            else {
                if (race.owners.indexOf(req.params.idOwner) == -1) {
                    race.owners.push(req.params.idOwner);
                    race.save(function (err, race) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        }
                    });
                }
                res.status(200);
                res.json(race);
            }
        }
    });
}

// Remove owner from a race
function removeOwner(req, res) {
    Race.findById(req.params.id, function (err, race) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            if (!race) {
                res.status(404);
                res.json({status: 404, message: "Race niet gevonden"});
            }
            else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            }
            else {
                if (race.owners.indexOf(req.params.idOwner) != -1) {
                    race.owners.splice(race.owners.indexOf(req.params.idOwner), 1);
                    race.save(function (err, race) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        }
                    });
                }
                res.status(200);
                res.json(race);
            }
        }
    });
}

// Add participant to a race
function addParticipant(req, res) {
    Race.findById(req.params.id, function (err, race) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            if (!race) {
                res.status(404);
                res.json({status: 404, message: "Race niet gevonden"});
            }
            else {
                if (race.participants.indexOf(req.user._id) == -1) {
                    race.participants.push(req.user._id);
                    race.save(function (err, race) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        }
                    });
                }
                res.status(200);
                res.json(race);
            }
        }
    });
}

// Remove participant from a race
function removeParticipant(req, res) {
    Race.findById(req.params.id, function (err, race) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            if (!race) {
                res.status(404);
                res.json({status: 404, message: "Race niet gevonden"});
            }
            else if (req.params.idParticipant) {
                if (race.owners.indexOf(req.user._id) != -1 || req.user.roles.indexOf("admin") != -1) {
                    if (race.participants.indexOf(req.params.idParticipant) != -1) {
                        race.participants.splice(race.participants.indexOf(req.params.idParticipant), 1);
                        race.save(function (err, race) {
                            if (err) {
                                return handleError(req, res, 500, err);
                            }
                        });
                        res.status(200);
                        res.json(race);
                    }
                }
                else {
                    res.status(403);
                    res.json({status: 403, message: "Forbidden"});
                }
            }
            else {
                if (race.participants.indexOf(req.user._id) != -1) {
                    race.participants.splice(race.participants.indexOf(req.user._id), 1);
                    race.save(function (err, race) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        }
                    });
                }
                res.status(200);
                res.json(race);
            }
        }
    });
}


// Add location to a race
function addLocation(req, res) {
    console.log("1");
	console.log("body: " + req.body.location);
    var location = new Location({
        name: req.body.location.name,
        lat: req.body.location.lat,
        long: req.body.location.long,
        distance: req.body.location.distance
    });
    typeof req.body.location.description != "undefined" ? location["description"] = req.body.location.description : location["description"] = null;
    console.log("2");
    location.save(function (err, location) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            res.status(201);
        }
    });
    console.log("3");
    Race.findById(req.params.id, function (err, race) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            if (!race) {
                res.status(404);
                res.json({status: 404, message: "Race niet gevonden"});
            }
            else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            }
            else {
                if (race.locations.indexOf(req.params.idLocation) == -1) {
                    race.locations.push({orderPosition: req.body.orderPosition, location: location._id});
                    race.save(function (err, race) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        }
                    });
                }
                res.status(200);
                res.json(race);
            }
        }
    });
}

// Remove location from a race
function removeLocation(req, res) {
    Race.findById(req.params.id, function (err, race) {
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            if (!race) {
                res.status(404);
                res.json({status: 404, message: "Race niet gevonden"});
            }
            else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            }
            else {

                for (var i = 0; i < race.locations.length; i++) {
                    if (race.locations[i]._id == req.params.idLocation) {
                        race.locations[i].remove();
                        break;
                    }
                }
                race.save(function (err, race) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }
                });

                Location.findByIdAndRemove(req.params.idLocation, function (err, location) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }
                });

                res.status(200);
                res.json(race);
            }
        }
    });
}

// Geeft pagina terug om locaties aan een race toe te voegen
function getLocationPage(req, res) {
	res.render('locatiesToevoegen', {"race_id": req.params.id});
}

// Add location to users visited locations
function addLocationToVisitedLocations(req, res) {
    var lat = parseFloat(req.params.lat);
    var long = parseFloat(req.params.long);

    if (lat == NaN || long == NaN)
    {
        res.status = 400;
        res.json({ status: 400, message: "Bad Request"});
    }

    Race.findById(req.params.id)
        .populate("locations.location")
        .exec(function (err, race) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            else {
                if (race.participants.indexOf(req.user._id) == -1) {
                    res.status(403);
                    return res.json({status: 403, message: "Je doet niet mee aan deze race"})
                }

                var checkedIn = false;

                console.log("Checking locations...");

                User.findById(req.user._id, function (err, user) {
                    if (err) {
                        return handleError(req, res, 500, err);
                    }
                    else {
                        for (i = 0; i < race.locations.length; i++) {
                            var location = race.locations[i].location;

                            var distance = getDistanceFromLatLonInM(lat, long, location.lat, location.long);

                            console.log("Checking user location (" + lat + "," + long + ") against location (" + location.lat + "," + location.long + ")");
                            console.log("Distance found: " + distance + " (max distance: " + location.distance + ")");

                            if (distance < location.distance) {
                                var exists = false;
                                for (j = 0; j < req.user.visitedLocations.length && !exists; j++) {
                                    if (req.user.visitedLocations[i].location == location._id) {
                                        exists = true;
                                    }
                                }

                                console.log("Distance < max distance. Exists? " + exists);

                                if (!exists) {
                                    checkedIn = true;
                                    user.visitedLocations.push({location: location._id, time: new Date()});
                                }
                            }
                        }
                        console.log("Saving user...");
                        user.save(function (err, user) {
                            if (err) {
                                return handleError(req, res, 500, err);
                            } else {
                                IO.of(race._id).emit("userCheckedIn", user.visitedLocations);
                                return res.json({checkedIn: checkedIn, locations: user.visitedLocations});
                            }
                        });
                    }
                });
            }
        });
}

function testSocket(req, res) {
    console.log("Sending test socket msg");
    IO.to(req.params.id).emit("userCheckedIn", { "test": true, "potato": [ "mashed", "salad" ]});
}

function getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
    //var R = 6371; // Radius of the earth in km
    //var dLat = deg2rad(lat2-lat1);  // deg2rad below
    //var dLon = deg2rad(lon2-lon1);
    //var a =
    //        Math.sin(dLat/2) * Math.sin(dLat/2) +
    //        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    //        Math.sin(dLon/2) * Math.sin(dLon/2)
    //    ;
    //var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    //var d = R * c; // Distance in km
    //return (d * 1000);

    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    dist = dist * 1609.344
    return dist

}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

router.route('/')
    .get(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), getAllRaces)
    .post(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), addRace);

router.route('/:id')
    .get(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), getRaceByID)
    .put(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), updateRaceByID)
    .delete(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), deleteRaceByID);

router.route('/:id/owner/:idOwner')
    .put(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), addOwner)
    .delete(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), removeOwner);

router.route('/:id/participant')
    .put(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), addParticipant)
    .delete(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), removeParticipant);

router.route('/:id/participant/:idParticipant')
    .delete(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), removeParticipant);

router.route('/:id/location')
	.get(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), getLocationPage)
    .post(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), addLocation);

router.route('/:id/location/:idLocation')
    .delete(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), removeLocation);

router.route('/:id/location/:lat/:long')
    .put(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), addLocationToVisitedLocations);

router.route('/:id/testSocket')
    .get(testSocket);

// Export
module.exports = function (mongoose, errCallback, io) {
    IO = io;
    io.on("connection", function(socket) {
        console.log("Races route socket connection!")
        socket.on("joinRoom", function(raceId) {
            console.log("User joining room " + raceId)
            socket.emit("joinRoom", raceId);
            socket.join(raceId);
        });
    });

    Race = mongoose.model('Race');
    User = mongoose.model('User');
    Location = mongoose.model('Location');
    handleError = errCallback;
    return router;
};
