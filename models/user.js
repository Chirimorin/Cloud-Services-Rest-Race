/*
ID
Naam
password
races
visitedlocations { location: location, tijd: tijd }
 */

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

	var userSchema = new mongoose.Schema({
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
        nickname: { type: String },
        authKey: { type: String },
		races: [{ type : String, ref: 'Race' }],
        visitedLocations: [{
            location: { type: String, ref: 'Location', required: true },
            time: { type: Date, required: true }
        }]
	});

    // methods ======================
    // generating a hash
    userSchema.methods.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    // checking if password is valid
    userSchema.methods.validPassword = function(password) {
        return bcrypt.compareSync(password, this.logins.local.password);
    };


module.exports = mongoose.model('User', userSchema);