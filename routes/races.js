var express = require('express');
var router = express.Router();
var Race;
var handleError;

// Get all races
function getAllRaces(req, res){
	Race.find({}, function(err, races){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(201);
			res.json(races);
		}
	});
}

// Get race by ID
function getRaceByID(req, res){
	Race.findById(req.params.id, function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(201);
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

// Update race by ID
function updateRaceByID(req, res){
	Race.findByIdAndUpdate(req.params.id, {$set: req.body}, function (err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(201);
			res.json(race);
		}
    });
}

// Delete race by ID
function deleteRaceByID(req, res){
	Race.findByIdAndRemove(req.params.id, function (err, result){
		if(err){ return handleError(req, res, 500, deletedRace); }
		else {
			res.status(201);
			res.json(deletedRace);
		}
    });
}

// Routing
router.route('/')
	.get(getAllRaces)
	.post(addRace);

router.route('/:id')
	.get(getRaceByID)
	.put(updateRaceByID)
	.delete(deleteRaceByID);

// Export
module.exports = function (mongoose, errCallback){
	Race = mongoose.model('Race');
	handleError = errCallback;
	return router;
};
