var passport = require('passport');
var express = require('express');
var router = express.Router();
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
function addRace(req, res){
	var race = new Race({
		name: req.body.name,
		hasSpecificOrder: req.body.hasSpecificOrder,
		startTime: req.body.startTime,
		private: req.body.private
	});
	typeof req.body.endTime != "undefined" ? race["endTime"] = req.body.endTime : location["endTime"] = null; 
	
	race.save(function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(201);
			res.json(race);
		}
	});
}

// Update race by ID
function updateRaceByID(req, res){
	var endTime;
	typeof req.body.endTime != "undefined" ? endTime = req.body.endTime : endTime = null;
	
	Race.findByIdAndUpdate(req.params.id, {$set: {name: req.body.name, hasSpecificOrder: req.body.hasSpecificOrder, startTime: req.body.startTime, endTime: endTime, private: req.body.private}}, function (err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
    });
}

// Delete race by ID
function deleteRaceByID(req, res){
	Race.findByIdAndRemove(req.params.id, function (err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
    });
}

// Add owner to a race
function addOwner(req, res){
	Race.findByIdAndUpdate(req.params.id, {$push:{owners:req.user._id}}, {safe: true}, function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
	});
}

// Remove owner from a race
function removeOwner(req, res){
	Race.findByIdAndUpdate(req.params.id, {$pull:{owners:req.user._id}}, {safe: true, upsert: true}, function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
	});
}

// Add participant to a race
function addParticipant(req, res){
	Race.findByIdAndUpdate(req.params.id, {$push:{participants:req.user._id}}, {safe: true, upsert: true}, function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
	});
}

// Remove participant from a race
function removeParticipant(req, res){
	Race.findByIdAndUpdate(req.params.id, {$pull:{participants:req.user._id}}, {safe: true, upsert: true}, function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
	});
}

// Add location to a race
function addLocation(req, res){
	Race.findByIdAndUpdate(req.params.id, {$push:{locations:{orderPosition: req.body.orderPosition, location: req.body.location}}}, 
	{safe: true, upsert: true}, function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
	});
}

// Remove location from a race
function removeLocation(req, res){
	Race.findByIdAndUpdate(req.params.id, {$pull:{locations:{_id:req.params.idLocation}}}, {safe: true, upsert: true}, function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		else {
			res.status(200);
			res.json(race);
		}
	});
}

// Add location to users visited locations
function addLocationToVisitedLocations(req, res){
	
}

router.route('/')
    .get(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), getAllRaces)
	.post(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), addRace);

router.route('/:id')
	.get(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), getRaceByID)
	.put(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), updateRaceByID)
	.delete(passport.authenticate('authKey', { failureRedirect: '/unauthorized' }), deleteRaceByID);
	
router.route('/:id/owner')
	.put(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), addOwner)
	.delete(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), removeOwner);
	
router.route('/:id/participant')
	.put(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), addParticipant)
	.delete(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), removeParticipant);
	
router.route('/:id/location')
	.post(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), addLocation);
	
router.route('/:id/location/:idLocation')	
	.delete(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), removeLocation);
	
router.route('/:id/location/:lat/:long')
	.put(passport.authenticate('authKey', {failureRedirect: '/unauthorized'}), addLocationToVisitedLocations);

// Export
module.exports = function (mongoose, errCallback){
	Race = mongoose.model('Race');
	handleError = errCallback;
	return router;
};
