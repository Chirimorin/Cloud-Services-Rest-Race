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
    /* istanbul ignore if  */
	if (req.accepts('text/html')) {
		return res.render('raceAanmaken');
	} else {
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
            /* istanbul ignore if  */
			if (err) {
				return handleError(req,res,500,err);
			} else {
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
            /* istanbul ignore else  */
            if (err.kind == "ObjectId") {
                // ObjectId cast failed, meaning the race doesn't exist.
                res.status(404);
                return res.json({ message: "Race niet gevonden" });
            } else {
                return handleError(req, res, 500, err);
            }
        } else if (!race) {
            res.status(404);
            return res.json({ message: "Race niet gevonden" });
        } else {
            race = filterLocations(race);

            res.status(200);
            /* istanbul ignore if  */
            if (req.accepts('text/html')) {
                var ownerIds = race.owners.map(function(e) { return JSON.stringify(e._id) });
                var participantIds = race.participants.map(function(e) { return JSON.stringify(e._id) });

                var isOwner = (ownerIds.indexOf(JSON.stringify(req.user._id)) != -1 || req.user.roles.indexOf("admin") != -1);
                var isParticipant = (participantIds.indexOf(JSON.stringify(req.user._id)) != -1);

                console.log("User " + req.user._id + " " + (isOwner ? "is an owner " : "") + (isParticipant ? "is a participant" : "") + (!isOwner && !isParticipant ? "Is neither owner or participant" : ""));
                return res.render('race', { "race": race, "isOwner": isOwner, "isParticipant": isParticipant, "userId": req.user._id });
            } else {
                return res.json(race);
            }
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

    race.validate(function(v) {
        if (v != null) {
            res.status(400);
            return res.json(v);
        } else {
            race.save(function (err, race) {
                /* istanbul ignore if  */
                if (err) {
                    /* istanbul ignore else  */
                    if (err.kind == "ObjectId") {
                        // ObjectId cast failed, meaning the race doesn't exist.
                        res.status(404);
                        return res.json({ message: "Race niet gevonden" });
                    } else {
                        return handleError(req, res, 500, err);
                    }
                } else {
                    res.status(201);

                    /* istanbul ignore if  */
                    if (req.accepts('text/html')) {
                        return res.render('profile');
                    } else {
                        res.json(race);
                    }
                }
            });
        }
    });
}

// Update race by ID
function updateRaceByID(req, res) {
    var endTime;
    typeof req.body.endTime != "undefined" ? endTime = req.body.endTime : endTime = null;

    Race.findById(req.params.id)
        .populate('locations.location')
        .exec(function (err, race) {
            if (err) {
                /* istanbul ignore else  */
                if (err.kind == "ObjectId") {
                    // ObjectId cast failed, meaning the race doesn't exist.
                    res.status(404);
                    return res.json({ message: "Race niet gevonden" });
                } else {
                    return handleError(req, res, 500, err);
                }
            } else if (!race) {
                res.status(404);
                return res.json({ message: "Race niet gevonden" });
            } else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            } else {
                race.name = req.body.name;
                race.hasSpecificOrder = req.body.hasSpecificOrder;
                race.startTime = req.body.startTime;
                race.endTime = endTime;
                race.private = req.body.private;

                race.validate(function(v) {
                    if (v != null) {
                        res.status(400);
                        return res.json(v);
                    } else {
                        race.save(function (err, race) {
                            /* istanbul ignore if  */
                            if (err) {
                                return handleError(req, res, 500, err);
                            } else {
                                raceChanged(race._id);
                                res.status(200);
                                res.json(race);
                            }
                        });
                    }
                });
            }
        });
}

// Delete race by ID
function deleteRaceByID(req, res) {
    Race.findById(req.params.id, function (err, race) {
        if (err) {
            /* istanbul ignore else  */
            if (err.kind == "ObjectId") {
                // ObjectId cast failed, meaning the race doesn't exist.
                res.status(404);
                return res.json({ message: "Race niet gevonden" });
            } else {
                return handleError(req, res, 500, err);
            }
        } else if (!race) {
            res.status(404);
            res.json({status: 404, message: "Race niet gevonden"});
        } else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
            res.status(403);
            res.json({status: 403, message: "Forbidden"});
        } else {
            race.remove();
            res.status(200);
            res.json(race);
        }
    });
}

// Add owner to a race
function addOwner(req, res) {
    Race.findById(req.params.id)
        .populate('locations.location')
        .exec(function (err, race) {
            if (err) {
                /* istanbul ignore else  */
                if (err.kind == "ObjectId") {
                    // ObjectId cast failed, meaning the race doesn't exist.
                    res.status(404);
                    return res.json({ message: "Race niet gevonden" });
                } else {
                    return handleError(req, res, 500, err);
                }
            } else if (!race) {
                res.status(404);
                return res.json({ message: "Race niet gevonden" });
            } else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            } else {
                /* istanbul ignore else  */
                if (race.owners.indexOf(req.params.idOwner) == -1) {
                    race.owners.push(req.params.idOwner);
                    race.save(function (err, race) {
                        /* istanbul ignore if  */
                        if (err) {
                            return handleError(req, res, 500, err);
                        } else {
                            raceChanged(race._id);
                            res.status(200);
                            res.json(race);
                        }
                    });
                } else {
                    res.status(200);
                    res.json(race);
                }
            }
    });
}

// Remove owner from a race
function removeOwner(req, res) {
    Race.findById(req.params.id)
        .populate('locations.location')
        .exec(function (err, race) {
            if (err) {
                /* istanbul ignore else  */
                if (err.kind == "ObjectId") {
                    // ObjectId cast failed, meaning the race doesn't exist.
                    res.status(404);
                    return res.json({ message: "Race niet gevonden" });
                } else {
                    return handleError(req, res, 500, err);
                }
            } else if (!race) {
                res.status(404);
                return res.json({ message: "Race niet gevonden" });
            } else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            } else {
                if (race.owners.indexOf(req.params.idOwner) != -1) {
                    race.owners.splice(race.owners.indexOf(req.params.idOwner), 1);
                    race.save(function (err, race) {
                        /* istanbul ignore if  */
                        if (err) {
                            return handleError(req, res, 500, err);
                        } else {
                            raceChanged(race._id);
                            res.status(200);
                            res.json(race);
                        }
                    });
                } else {
                    res.status(404);
                    res.json({ message: "Gebruiker is geen eigenaar van deze race." });
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
                /* istanbul ignore else  */
                if (err.kind == "ObjectId") {
                    // ObjectId cast failed, meaning the race doesn't exist.
                    res.status(404);
                    return res.json({ message: "Race niet gevonden" });
                } else {
                    return handleError(req, res, 500, err);
                }
            } else if (!race) {
                res.status(404);
                return res.json({ message: "Race niet gevonden" });
            } else {
                var now = new Date();
                var raceEnd = new Date(race.endTime);

                /* istanbul ignore if  */
                if (now > raceEnd) {
                    // Helaas niet te testen met test data omdat een einddatum niet voor nu mag zijn bij opslaan.
                    res.status = 400;
                    return res.json({ message: "Race is geëindigd, helaas!" })
                }

                /* istanbul ignore else  */
                if (race.participants.indexOf(req.user._id) == -1) {
                    race.participants.push(req.user._id);
                    race.save(function (err, race) {
                        /* istanbul ignore if  */
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
    });
}

// Remove participant from a race
function removeParticipant(req, res) {
    Race.findById(req.params.id)
        .populate("locations.location")
        .exec(function (err, race) {
            if (err) {
                /* istanbul ignore else  */
                if (err.kind == "ObjectId") {
                    // ObjectId cast failed, meaning the race doesn't exist.
                    res.status(404);
                    return res.json({ message: "Race niet gevonden" });
                } else {
                    return handleError(req, res, 500, err);
                }
            } else if (!race) {
                res.status(404);
                return res.json({ message: "Race niet gevonden" });
            } else {
                var locationIds = race.locations.map(function(e) {
                    return JSON.stringify(e.location._id);
                });

                if (req.params.idParticipant) {
                    if (race.owners.indexOf(req.user._id) != -1 || req.user.roles.indexOf("admin") != -1) {
                        console.log("Owner/admin participant removal.");
                        console.log("idParticipant: " + req.params.idParticipant);
                        console.log("participants: " + race.participants);

                        if (race.participants.indexOf(req.params.idParticipant) != -1) {
                            race.participants.splice(race.participants.indexOf(req.params.idParticipant), 1);
                            race.save(function (err, race) {
                                /* istanbul ignore if  */
                                if (err) {
                                    return handleError(req, res, 500, err);
                                } else {
                                    removeUserLocations(req.params.idParticipant, locationIds);
                                    raceChanged(race._id);
                                    res.status(200);
                                    return res.json(race);
                                }
                            });
                        } else {
                            res.status(404);
                            res.json({message: "Deze gebruiker is geen deelnemer in deze race."});
                        }
                    } else {
                        res.status(403);
                        res.json({status: 403, message: "Forbidden"});
                    }
                } else {
                    console.log("user participant removal.");
                    console.log("idParticipant: " + req.user._id);
                    console.log("participants: " + race.participants);

                    if (race.participants.indexOf(req.user._id) != -1) {
                        race.participants.splice(race.participants.indexOf(req.user._id), 1);
                        race.save(function (err, race) {
                            /* istanbul ignore if  */
                            if (err) {
                                return handleError(req, res, 500, err);
                            } else {
                                removeUserLocations(req.user._id, locationIds);
                                raceChanged(race._id);
                                res.status(200);
                                res.json(race);
                            }
                        });
                    } else {
                        res.status(404);
                        res.json({ message: "Je bent geen deelnemer in deze race." });
                    }
                }
            }
    });
}

function removeUserLocations(userId, locationIds) {
    console.log("Removing locations " + locationIds + " from user " + userId);

    /* istanbul ignore else  */
    if (userId && locationIds) {
        User.findById(userId, function (err, user) {
            /* istanbul ignore if  */
            if (err) {
                console.log("Error finding user: " + err);
            } else {
                for (i = user.visitedLocations.length - 1; i >= 0; i--) {
                    if (locationIds.indexOf(JSON.stringify(user.visitedLocations[i].location)) != -1) {
                        user.visitedLocations.splice(i, 1);
                    }
                }

                user.save(function (err, user) {
                    /* istanbul ignore if  */
                    if (err) {
                        console.log("Error saving user: " + err);
                    } else {
                        console.log("User locations removed successfully.");
                    }
                });
            }
        });
    }
}

// Add location to a race
function addLocation(req, res) {
    var location = new Location({
        name: req.body.location.name,
        lat: req.body.location.lat,
        long: req.body.location.long,
        distance: req.body.location.distance
    });

    if (!location.name || !location.lat || !location.long || !location.distance) {
        res.status(400);
        return res.json({ message: "Niet alle verplichte velden zijn ingevult" });
    }

    typeof req.body.location.description != "undefined" ? location["description"] = req.body.location.description : location["description"] = null;
    location.save(function (err, location) {
        /* istanbul ignore if  */
        if (err) {
            return handleError(req, res, 500, err);
        }
        else {
            res.status(201);
        }
    });
    Race.findById(req.params.id)
        .populate('locations.location')
        .exec(function (err, race) {
            if (err) {
                /* istanbul ignore else  */
                if (err.kind == "ObjectId") {
                    // ObjectId cast failed, meaning the race doesn't exist.
                    res.status(404);
                    return res.json({ message: "Race niet gevonden" });
                } else {
                    return handleError(req, res, 500, err);
                }
            } else if (!race) {
                res.status(404);
                return res.json({ message: "Race niet gevonden" });
            } else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            } else {
                /* istanbul ignore else  */
                if (race.locations.indexOf(req.params.idLocation) == -1) {
                    race.locations.push({orderPosition: req.body.orderPosition, location: location});
                    race.save(function (err, newRace) {
                        /* istanbul ignore if  */
                        if (err) {
                            return handleError(req, res, 500, err);
                        } else {
                            raceChanged(race._id);
                            res.status(200);
                            res.json(newRace);
                        }
                    });
                } else {
                    res.status(200);
                    res.json(race);
                }

            }
    });
}

// Remove location from a race
function removeLocation(req, res) {
    Race.findById(req.params.id)
        .populate('locations.location')
        .exec(function (err, race) {
            if (err) {
                /* istanbul ignore else  */
                if (err.kind == "ObjectId") {
                    // ObjectId cast failed, meaning the race doesn't exist.
                    res.status(404);
                    return res.json({ message: "Race niet gevonden" });
                } else {
                    return handleError(req, res, 500, err);
                }
            } else if (!race) {
                res.status(404);
                return res.json({ message: "Race niet gevonden" });
            } else if (race.owners.indexOf(req.user._id) == -1 && req.user.roles.indexOf("admin") == -1) {
                res.status(403);
                res.json({status: 403, message: "Forbidden"});
            } else {

                for (var i = 0; i < race.locations.length; i++) {
                    /* istanbul ignore else  */
                    if (race.locations[i].location._id == req.params.idLocation) {
                        race.locations[i].remove();
                        break;
                    }
                }
                race.save(function (err, race) {
                    /* istanbul ignore if  */
                    if (err) {
                        return handleError(req, res, 500, err);
                    } else {
                        raceChanged(race._id);
                    }
                });

                Location.findByIdAndRemove(req.params.idLocation, function (err, location) {
                    /* istanbul ignore if  */
                    if (err) {
                        return handleError(req, res, 500, err);
                    }
                });

                res.status(200);
                res.json(race);
            }
    });
}

// Geeft pagina terug om locaties aan een race toe te voegen
/* istanbul ignore next  */
function getLocationPage(req, res) {
	res.render('locatiesToevoegen', {"race_id": req.params.id});
}

// Add location to users visited locations
function addLocationToVisitedLocations(req, res) {
    var lat = parseFloat(req.params.lat);
    var long = parseFloat(req.params.long);

    if ((isNaN(lat) || isNaN(long)))
    {
        res.status(400);
        return res.json({ status: 400, message: "Bad Request"});
    }

    Race.findById(req.params.id)
        .populate("participants")
        .populate("locations.location")
        .exec(function (err, race) {
            if (err) {
                /* istanbul ignore else  */
                if (err.kind == "ObjectId") {
                    // ObjectId cast failed, meaning the race doesn't exist.
                    res.status(404);
                    return res.json({ message: "Race niet gevonden" });
                } else {
                    return handleError(req, res, 500, err);
                }
            } else if (!race) {
                res.status(404);
                return res.json({ message: "Race niet gevonden" });
            } else {
                var now = new Date();
                var raceStart = new Date(race.startTime);
                var raceEnd = new Date(race.endTime);

                if (raceStart > now) {
                    res.status = 400;
                    return res.json({ message: "Race is nog niet gestart! Probeer het later nog eens." })
                }

                /* istanbul ignore if  */
                if (now > raceEnd) {
                    // Helaas ook niet te testen met test data.
                    res.status = 400;
                    return res.json({ message: "Race is geëindigd, helaas!" })
                }

                for (i = 0; i < race.participants.length; i++) {
                    // Stringify on the _ids because otherwise the comparison will always be false.
                    if (!(JSON.stringify(race.participants[i]._id) == JSON.stringify(req.user._id))) {
                        console.log("User " + req.user._id + " is not a participant");
                        res.status(403);
                        return res.json({status: 403, message: "Je doet niet mee aan deze race"})
                    }
                }

                race = filterLocations(race)

                var checkedIn = false;

                User.findById(req.user._id, function (err, user) {
                    /* istanbul ignore if  */
                    if (err) {
                        return handleError(req, res, 500, err);
                    } else {
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
                            /* istanbul ignore if  */
                            if (err) {
                                return handleError(req, res, 500, err);
                            } else {
                                // Get the race again for updated location data.

                                Race.findById(req.params.id)
                                    .populate("participants")
                                    .populate("locations.location")
                                    .exec(function (err, newRace){
                                        /* istanbul ignore else  */
                                        if (!err) {
                                            raceChanged(newRace._id);
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

function raceChanged(raceId) {
    console.log("Race " + raceId + " changed");

    Race.findById(raceId)
        .populate("participants")
        .populate("owners")
        .populate("locations.location")
        .exec(function (err, race) {
            /* istanbul ignore if  */
            if (err || !race) {
                console.log("Error loading race " + raceId);
                console.log(err);
            } else {
                race = filterLocations(race);
                IO.to(raceId).emit("raceChanged", race);
            }
        });
}

function getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
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

function filterLocations(race) {
    // Make sure no false references are present in the race.
    race = cleanupRace(race);

    /* istanbul ignore else  */
    if (race) {
        /* istanbul ignore else  */
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
                    /* istanbul ignore if  */
                    if (!found) {
                        // Only happens if there's false data in the database. It's good if this never runs.
                        race.participants[i].visitedLocations.splice(j, 1);
                    }

                }
            }
        }
    }

    return race;
}

/* istanbul ignore next  */
function cleanupRace(race) {
    // This functions clears all wrong references.
    // Ignored for code coverage because it normally doesn't do anything.

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

// Export
module.exports = function (mongoose, errCallback, io) {
    IO = io;
    /* istanbul ignore next  */
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
