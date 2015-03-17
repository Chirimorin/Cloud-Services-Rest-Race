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
            google           : {
                id           : String,
                token        : String,
                email        : String,
                name         : String
            }
        },
		races: [{ type : String, ref: 'Race' }],
        visitedLocations: [{
            location: { type: String, ref: 'Location', required: true },
            time: { type: Date, required: true }
        }]
	});
	
	mongoose.model('User', userSchema);
}

module.exports = init;