var express = require('express');
var router = express.Router();
var Race;
var handleError;

// Get all races
function getAllRaces(req, res){
	var result = Race.find({});
	result.exec(function(err, races){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.json(races);
		}
	});
}

// Get race by ID
function getRaceByID(req, res){
	var result = Race.find({_id:req.params.id});
	result.exec(function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.json(race);
		}
	});
}

// Add race
function addRace(req, res){
	var race = new Race(req.body);
	race.save(function(err, savedRace){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(201);
			res.json(savedRace);
		}
	});
}

// Delete race by ID
function deleteRaceByID(req, res){
	var result = Race.find({_id:req.params.id});
	result.remove(function ( err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.redirect('/');
		}
    });
}

// Routing
router.route('/')
	.get(getAllRaces)
	.post(addRace);

router.route('/:id')
	.get(getRaceByID)
	.delete(deleteRaceByID);

// Export
module.exports = function (mongoose, errCallback){
	Race = mongoose.model('Race');
	handleError = errCallback;
	return router;
};
