var passportStub = require('passport-stub');
var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('../app');
var User = require('mongoose').model('User');

passportStub.install(app);

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
		
		it('should return 403 when not logged in', function(done) {
			makeRequest('/races', 403, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when logged in', function(done) {
			passportStub.login(new User());
			makeRequest('/races', 200, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});	
		});
		
	});
});
