/*
Id
Naam
eigenaren
deelnemers
locaties
begintijd
eindtijd
 */


// Nodig: name, hasSpecificOrder, startTime, endTime (optional), private

function init(mongoose){

	var raceSchema = new mongoose.Schema({
		name: { type: String, required: true },
        owners: [{ type : String, ref: 'User' }],
        participants: [{ type : String, ref: 'User' }],
        hasSpecificOrder: { type: Boolean, required: true },
        locations: [{
            orderPosition: { type: Number, required: false },
            location: { type : String, ref: 'Location', required: true }
        }],
        startTime: { type: Date, required: true },
        endTime: { type: Date },
        private: { type: Boolean, required: true }
	});
	
	raceSchema.path('owners').validate(function(val){
		return val.length > 0;
	}, 'Er moet minstens 1 owner zijn.');
	
	raceSchema.path('endTime').validate(function(val){
		if (val) { return val > new Date(); }
		return true;
	}, 'Eindtijd kan niet vroeger dan nu zijn.');
	
	raceSchema.path('endTime').validate(function(val){
		if (val) { return val > this.startTime; }
		return true;
	}, 'Eindtijd kan niet voor de starttijd zijn.');
	
	mongoose.model('Race', raceSchema);
}

module.exports = init;