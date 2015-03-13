/*
ID
Naam
password
races
visitedlocations { location: location, tijd: tijd }
 */

function init(mongoose){

	var userSchema = new mongoose.Schema({
        _id: { type: String, required: true, unique: true, lowercase: true },
		username: { type: String, required: true },
		password: { type: String, required: true },
		races: [{ type : ObjectId, ref: 'Race' }],
        visitedLocations: [{
            location: { type: ObjectId, ref: 'Location', required: true },
            time: { type: Date, required: true }
        }]
	});
	
	mongoose.model('User', userSchema);
}

module.exports = init;