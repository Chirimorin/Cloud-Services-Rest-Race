var express = require('express');
var router = express.Router();
var passport = require('passport');
var Race;
var handleError;

// Get all races
function getAllRaces(req, res){
	Race.find({}, function(err, races){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(races);
		}
	});
}

// Get race by ID
function getRaceByID(req, res){
	Race.findById(req.params.id, function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
	});
}

// Add race
// Nodig: name, hasSpecificOrder, startTime, endTime (optional), private
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
// Nodig: name, hasSpecificOrder, startTime, endTime (optional), private
function updateRaceByID(req, res){
	Race.findByIdAndUpdate(req.params.id, {$set: req.body}, function (err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
    });
}

// Add participant to a race
function addParticipant(req, res){
	Race.findById(req.params.id, {$push:{participants:req.body}}, function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
	});
}

// Remove participant from a race
function removeParticipant(req, res){
	Race.findById(req.params.id, {$pull:{participants:req.body}}, function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
	});
}

// Delete race by ID
function deleteRaceByID(req, res){
	Race.findByIdAndRemove(req.params.id, function (err, result){
		if(err){ return handleError(req, res, 500, deletedRace); }
		else {
			res.status(200);
			res.json(deletedRace);
		}
    });
}

// Routing
/*router.route('/')
	.get(getAllRaces)
	.post(addRace);*/

// Controleren of dit werkt
router.route('/')
    .get(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), getAllRaces)
    .post(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), addRace);

router.route('/:id')
	.get(getRaceByID)
	.put(updateRaceByID) // Nodig?
	.put(addParticipant)
	.delete(deleteRaceByID);
	
router.route('/:id/participant')
	.put(addParticipant)

router.route('/:id/participant/:participantID')
	.delete(removeParticipant);

// Export
module.exports = function (mongoose, errCallback){
	Race = mongoose.model('Race');
	handleError = errCallback;
	return router;
};
