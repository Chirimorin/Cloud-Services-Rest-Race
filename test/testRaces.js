var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('../app');
var User = require('mongoose').model('User');

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
