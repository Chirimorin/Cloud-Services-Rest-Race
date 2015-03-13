var express = require('express');
var router = express.Router();
var Race;
var handleError;

// Get all races
function getRaces(req, res){
	var result = Race.find({});
	result.exec(function(err, races){
		res.json(races);
	});
}

// Get race by ID
function getRaceByID(req, res){
	var query = { _id:req.params.id };
	var result = Race.find(query);
	result.exec(function(err, race){
		if(err){ return handleError(req, res, 500, err); }
		res.json(race);
	});
}

// Routing
router.route('/')
	.get(getRaces);

router.route('/:id')
	.get(getRaceByID);

// Export
module.exports = function (mongoose, errCallback){
	Author = mongoose.model('Race');
	handleError = errCallback;
	return router;
};
