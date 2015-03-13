/*
Id
Naam
eigenaren
deelnemers
locaties
begintijd
eindtijd
 */


function init(mongoose){

	var raceSchema = new mongoose.Schema({
        _id: { type: String, required: true, unique: true, lowercase: true },
		name: { type: String, required: true },
        owners: [{ type : ObjectId, ref: 'User' }],
        participants: [{ type : ObjectId, ref: 'User' }],
        hasSpecificOrder: { type: Boolean, required: true },
        locations: [{
            orderPosition: { type: Number, required: false },
            location: { type : ObjectId, ref: 'Location', required: true }
        }],
        startTime: { type: Date, required: true },
        endTime: { type: Date },
        private: { type: Boolean, required: true }
	});
	
	mongoose.model('Race', raceSchema);
}

module.exports = init;