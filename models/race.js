function init(mongoose){

	var raceSchema = new mongoose.Schema({
		name: { type: String, required: true }
	});
	
	mongoose.model('Race', raceSchema);
}

module.exports = init;