var passport = require('passport');
var express = require('express');
var router = express.Router();
var Location;
var handleError;

// Get all locations
function getAllLocations(req, res){
	Location.find({}, function(err, locations){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(locations);
		}
	});
}

// Get location by ID
function getLocationByID(req, res){
	Location.findById(req.params.id, function(err, location){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(location);
		}
	});
}

// Add location
function addLocation(req, res){
	var location = new Location({
		name: req.body.name,
		description: req.body.description,
		lat: 1,	// MOET NOG !!!
        long: 1, // MOET NOG !!!
		distance: req.body.distance
	});
	typeof req.body.description != "undefined" ? location["description"] = req.body.description : location["description"] = null; 	
	
	location.save(function(err, location){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(201);
			res.json(location);
		}
	});
}

// Update location by ID
function updateLocationByID(req, res){
	var description;
	typeof req.body.description != "undefined" ? description = req.body.description : description = null; 	
	
	Location.findByIdAndUpdate(req.params.id, {$set: {name: req.body.name, description: description, lat: 1, long: 1, // MOET NOG !!!
	distance: req.body.distance}}, function (err, location){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(location);
		}
    });
}

// Delete location by ID
function deleteLocationByID(req, res){
	Location.findByIdAndRemove(req.params.id, function (err, location){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(location);
		}
    });
}

router.route('/')
    .get(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), getAllLocations)
	.post(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), addLocation);

router.route('/:id')
	.get(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), getLocationByID)
	.put(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), updateLocationByID)
	.delete(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), deleteLocationByID);

// Export
module.exports = function (mongoose, errCallback){
	Location = mongoose.model('Location');
	handleError = errCallback;
	return router;
};

