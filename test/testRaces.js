var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('../app');
var User            = require('../models/user');
//var User = require('mongoose').model('User');

passportStub.install(app);


var testUser = {
    "_id" : "551181913402a0080411d5af",
    "visitedLocations" : [],
    "races" : [],
    "logins" : {
        "local" : {
            "password" : "$2a$08$EbIlLYaVzatp0Puz5Co3Vu4ObWH.QpvlLriGuWXQiFq2KdX9UQh6y",
            "email" : "blah2@blah.com"
        }
    },
    "__v" : 0,
    "authKey" : "e6142f65-2c8f-4e9c-9604-23d56f48f765"
};

function makeRequest(route, statusCode, done) {
	request(app)
		.get(route)
		.expect(statusCode)
		.end(function(err, res) {
			if(err){ return done(err); }

			done(null, res);
		});
};

describe('Testing races route', function() {
	describe('Get /races', function() {
		
		/*beforeEach(function(done){
			testdata.fillTestdata(done);
		});*/
		
		it('should return 302 when not logged in', function(done) {
			makeRequest('/races', 302, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when logged in', function(done) {
			makeRequest('/races?apikey=e6142f65-2c8f-4e9c-9604-23d56f48f765', 200, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});
		});
		
		it('should return 3 races', function(done) {
			makeRequest('/races?apikey=e6142f65-2c8f-4e9c-9604-23d56f48f765', 200, function(err, res) {
				if(err){ return done(err); }
				
				expect(res.body.races).to.not.be.undefined;
				expect(res.body.races).to.have.length(3);
					
				done();
			});	
		});	
		
	});
});
