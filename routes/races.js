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
            race = filterLocations(race);

            res.status(200);
            if (req.accepts('text/html')) {
                var ownerIds = race.owners.map(function(e) { return JSON.stringify(e._id) });
                var participantIds = race.participants.map(function(e) { return JSON.stringify(e._id) });

                var isOwner = (ownerIds.indexOf(JSON.stringify(req.user._id)) != -1 || req.user.roles.indexOf("admin") != -1);
                var isParticipant = (participantIds.indexOf(JSON.stringify(req.user._id)) != -1);

                console.log("User " + req.user._id + " " + (isOwner ? "is an owner " : "") + (isParticipant ? "is a participant" : "") + (!isOwner && !isParticipant ? "Is neither owner or participant" : ""));
                return res.render('race', { "race": race, "isOwner": isOwner, "isParticipant": isParticipant, "userId": req.user._id });
            }
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
                    } else {
                        raceChanged(race._id);
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
                        } else {
                            raceChanged(race._id);
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
                        } else {
                            raceChanged(race._id);
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
    Race.findById(req.params.id)
        .populate("locations.location")
        .exec(function (err, race) {
        if (err) {
            Console.log("Error loading race");
            return handleError(req, res, 500, err);
        }
        else {
            if (!race) {
                res.status(404);
                res.json({status: 404, message: "Race niet gevonden"});
            }
            else {
                var now = new Date();
                var raceEnd = new Date(race.endTime);

                if (now > raceEnd) {
                    res.status = 400;
                    return res.json({ message: "Race is geëindigd, helaas!" })
                }

                if (race.participants.indexOf(req.user._id) == -1) {
                    race.participants.push(req.user._id);
                    race.save(function (err, race) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        } else {
                            raceChanged(race._id);
                            res.status(200);
                            return res.json(race);
                        }
                    });
                } else {
                    res.status(200);
                    return res.json(race);
                }
            }
        }
    });
}

// Remove participant from a race
function removeParticipant(req, res) {
    Race.findById(req.params.id)
        .populate("locations.location")
        .exec(function (err, race) {
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
                            } else {
                                raceChanged(race._id);
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
                        } else {
                            raceChanged(race._id);
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
	console.log("body: " + req.body);
    console.log("orderPosition: " + req.body.orderPosition);
    console.log("location: " + req.body.location);
    console.log("location name: " + req.body.location["name"]);
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
                    race.save(function (err, newRace) {
                        if (err) {
                            return handleError(req, res, 500, err);
                        } else {
                            raceChanged(race._id);
                            res.status(200);
                            res.json(newRace);
                        }
                    });
                }

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
                    } else {
                        raceChanged(race._id);
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
        .populate("participants")
        .populate("locations.location")
        .exec(function (err, race) {
            if (err) {
                return handleError(req, res, 500, err);
            }
            else {
                var now = new Date();
                var raceStart = new Date(race.startTime);
                var raceEnd = new Date(race.endTime);

                if (raceStart > now) {
                    res.status = 400;
                    return res.json({ message: "Race is nog niet gestart! Probeer het later nog eens." })
                }

                if (now > raceEnd) {
                    res.status = 400;
                    return res.json({ message: "Race is geëindigd, helaas!" })
                }

                race = filterLocations(race);

                var participates = false;

                for (i = 0; i < race.participants.length && !participates; i++) {
                    // Stringify on the _ids because otherwise the comparison will always be false.
                    if (JSON.stringify(race.participants[i]._id) == JSON.stringify(req.user._id)) {
                        participates = true;
                    }
                }

                if  (!participates) {
                    console.log("User " + req.user._id + " is not a participant");
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
                                    if (req.user.visitedLocations[j].location == location._id) {
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
                                // Get the race again for updated location data.

                                Race.findById(req.params.id)
                                    .populate("participants")
                                    .populate("locations.location")
                                    .exec(function (err, newRace){
                                        if (!err) {
                                            raceChanged(newRace._id);
                                            //filterLocations(newRace);
                                            //IO.to(req.params.id).emit("userCheckedIn", newRace);
                                        }
                                        return res.json({checkedIn: checkedIn, locations: user.visitedLocations});
                                    });


                            }
                        });
                    }
                });
            }
        });
}

function testSocket(req, res) {
    console.log("Sending test socket msg")

    raceChanged(req.params.id);
    return res.json("sending socket message...");
}

function raceChanged(raceId) {
    console.log("Race " + raceId + " changed");

    Race.findById(raceId)
        .populate("participants")
        .populate("owners")
        .populate("locations.location")
        .exec(function (err, race) {
            if (err) {
                console.log("Error loading race " + raceId);
                console.log(err);
            } else {
                race = filterLocations(race);
                IO.to(raceId).emit("userCheckedIn", race);
            }
        });
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

function filterLocations(race) {
    // Make sure no false references are present in the race.
    race = cleanupRace(race);

    if (race) {
        if (race.locations) {
            // Map all location Ids that are part of this race.
            var locationIds = race.locations.map(function (e) {
                return e.location._id
            });

            // Loop through every participant to check visitedLocations
            for (i = 0; i < race.participants.length; i++) {
                var visitedLocations = race.participants[i].visitedLocations;

                // Loop through every visited location to check if it exists in the race.
                // Looping backwards so removals don't cause skips and index out of bounds problems.
                for (j = visitedLocations.length - 1; j >= 0; j--) {
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
        }
    }

    return race;
}

function cleanupRace(race) {
    // This functions clears all wrong references.

    if (race) {
        var edited = false;

        if (race.locations) {
            for (i = race.locations.length-1; i >= 0; i--) {
                if (!race.locations[i].location) {
                    console.log("Race location at index " + i + " is null. Removing it...");
                    race.locations.splice(i, 1);
                    edited = true;
                }
            }
        }

        if (race.participants) {
            for (i = race.participants.length-1; i >= 0; i--) {
                var participant = race.participants[i];

                if (!participant._id) {
                    // If an _id is present, participants are populated and it exists.
                    if (participant == "" || participant == null) {
                        // Empty string is always incorrect.
                        console.log("Race has empty participant at index " + i);
                        race.participants.splice(i, 1);
                        edited = true;
                    }
                }
            }
        }

        if (race.owners) {
            for (i = race.owners.length-1; i >= 0; i--) {
                var owner = race.owners[i];

                if (!owner._id) {
                    // If an _id is present, participants are populated and it exists.
                    if (owner == "" || owner == null) {
                        // Empty string is always incorrect.
                        console.log("Race has empty owner at index " + i);
                        race.owners.splice(i, 1);
                        edited = true;
                    }
                }
            }
        }

        if (edited) {
            race.save(function (err, race) {
                if (err) {
                    console.log("Failed to save edited race!");
                } else {
                    console.log("Successfully removed nonexistant locations from race.");
                }
            });
        }

        return race;
    }
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
