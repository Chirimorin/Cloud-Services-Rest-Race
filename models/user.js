/*
ID
Naam
password
races
visitedlocations { location: location, tijd: tijd }
 */

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

function init(mongoose){

	var userSchema = new mongoose.Schema({
        _id: { type: String, required: true, unique: true, lowercase: true },
        logins: {
            local            : {
                email        : String,
                password     : String
            },
            facebook         : {
                id           : String,
                token        : String,
                email        : String,
                name         : String
            },
            twitter          : {
                id           : String,
                token        : String,
                displayName  : String,
                username     : String
            },
            google           : {
                id           : String,
                token        : String,
                email        : String,
                name         : String
            }
        },
		races: [{ type : ObjectId, ref: 'Race' }],
        visitedLocations: [{
            location: { type: ObjectId, ref: 'Location', required: true },
            time: { type: Date, required: true }
        }]
	});
	
	mongoose.model('User', userSchema);
}

module.exports = init;