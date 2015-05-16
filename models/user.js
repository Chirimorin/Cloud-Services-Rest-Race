/*
ID
Naam
password
races
visitedlocations { location: location, tijd: tijd }
 */

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var _ = require('underscore');

	var userSchema = new mongoose.Schema({
        roles 			     : [String],
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
	
	userSchema.path('logins.local.email').validate(function (email) {
		var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		return emailRegex.test(email);
	}, 'E-mailadres is niet geldig.');

    // methods ======================
    // generating a hash
    userSchema.methods.generateHash = function(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };

    // checking if password is valid
    userSchema.methods.validPassword = function(password) {
        return bcrypt.compareSync(password, this.logins.local.password);
    };

userSchema.methods.hasAnyRole = function(roles){
    console.log("has any role");

    /* istanbul ignore next  */
    if(!Array.isArray(roles)){
        roles = [roles];
    }

    var lowerCaseRoles = _.map(this.roles, function(role){ return role.toLowerCase(); });
    for(var index in roles){
        if(_.contains(lowerCaseRoles, roles[index].toLowerCase())){
            // If any role matches, it's all right, we can return true;
            return true;
        }
    };

    return false;
};

module.exports = mongoose.model('User', userSchema);