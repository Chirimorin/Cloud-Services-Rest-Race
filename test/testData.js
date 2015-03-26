var async = require('async');
var mongoose = require('mongoose');
var Race = mongoose.model('Race');

function fillRaces(done){
	Race.remove({}, function(){
		async.parallel([
			function(cb) { new Race({ _id: 'race1', name: 'Race 1'}).save(cb); },
			function(cb) { new Race({ _id: 'race2', name: 'Race 2'}).save(cb); },
			function(cb) { new Race({ _id: 'race3', name: 'Race 3'}).save(cb); }
		], function() {
			done();
		})
	});
};

module.exports = {
	fillTestdata: function(done){
		async.parallel([
			fillRaces
		], function(){ done() });
	}
}