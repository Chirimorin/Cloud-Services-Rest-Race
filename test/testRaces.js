var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('../app');
var User = require('mongoose').model('User');

function getRequest(route, statusCode, done) {
	request(app)
		.get(route)
		.set('Accept',  'application/json')
		.expect(statusCode)
		.end(function(err, res) {
			if(err){ return done(err); }

			done(null, res);
		});
};

function postRequest(route, data, statusCode, done) {
	request(app)
		.post(route)
		.set('Accept',  'application/json')
		.send(data)
		.expect(statusCode)
		.end(function(err, res) {
			if(err){ return done(err); }

			done(null, res);
		});
};

function putRequest(route, data, statusCode, done) {
	request(app)
		.put(route)
		.set('Accept',  'application/json')
		.send(data)
		.expect(statusCode)
		.end(function(err, res) {
			if(err){ return done(err); }

			done(null, res);
		});
};

function deleteRequest(route, statusCode, done) {
	request(app)
		.delete(route)
		.set('Accept',  'application/json')
		.expect(statusCode)
		.end(function(err, res) {
			if(err){ return done(err); }

			done(null, res);
		});
};

describe('Testing races route', function() {
	
	describe('Get all races', function() {
		
		// Reset data in de database
		getRequest('/data', 200, function(err, res) {});	
		
		it('should return 302 when not logged in', function(done) {
			getRequest('/races', 302, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when logged in', function(done) {
			getRequest('/races?apikey=test', 200, function(err, res) { // AuthKey user1
				if(err){ return done(err); }
				
				done();
			});
		});
		
		it('should return 5 races', function(done) {
			getRequest('/races?apikey=test', 200, function(err, res) { // AuthKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body).to.have.length(5);
					
				done();
			});	
		});	
		
	});
	
	describe('Get race by ID', function() {
		
		// Reset data in de database
		getRequest('/data', 200, function(err, res) {});
		
		it('should return 302 when not logged in', function(done) {
			getRequest('/races/4edd40c86762e0fb12000001', 302, function(err, res) { // Id race1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when logged in', function(done) {
			getRequest('/races/4edd40c86762e0fb12000001?apikey=test', 200, function(err, res) { // Id race1, authKey user1
				if(err){ return done(err); }
				
				done();
			});
		});
		
		it('should return a race', function(done) {
			getRequest('/races/4edd40c86762e0fb12000001?apikey=test', 200, function(err, res) { // Id race1, authKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body._id).to.equal("4edd40c86762e0fb12000001"); // Id race1
					
				done();
			});	
		});
		
		it('should return 500 when race is wrong', function(done) { // AuthKey user1
			getRequest('/races/blabla?apikey=test', 500, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});			
		});
		
	});
	
	describe('Add race', function() {		
	
		// Reset data in de database
		getRequest('/data', 200, function(err, res) {});
		
		it('should return 302 when not logged in', function(done) {
			var race = {
				name: "Race 6",
				hasSpecificOrder: false,
				startTime: new Date(2015, 5, 11, 20, 0, 0, 0),
				private: false
			};
			postRequest('/races', race, 302, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 500 when race data is wrong', function(done) {
			var race = {
				hasSpecificOrder: false,
				startTime: new Date(2015, 5, 11, 20, 0, 0, 0),
				private: false
			};
			postRequest('/races?apikey=test', race, 500, function(err, res) { // AuthKey user1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 201 when logged in', function(done) {
			var race = {
				name: "Race 6",
				hasSpecificOrder: false,
				startTime: new Date(2015, 5, 11, 20, 0, 0, 0),
				private: false
			};
			postRequest('/races?apikey=test', race, 201, function(err, res) { // AuthKey user1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return new race', function(done) {
			var race = {
				name: "Race 7",
				hasSpecificOrder: false,
				startTime: new Date(2015, 5, 11, 20, 0, 0, 0),
				endTime: new Date(2015, 5, 12, 30, 0, 0),
				private: false
			};
			postRequest('/races?apikey=test', race, 201, function(err, res) { // AuthKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.name).to.equal("Race 7");
				
				done();
			});			
		});
		
	});
	
	describe('Update race', function() {

		// Reset data in de database
		getRequest('/data', 200, function(err, res) {});	
		
		it('should return 302 when not logged in', function(done) {
			var race = {
				name: "Race 1 Aangepast",
				hasSpecificOrder: true,
				startTime: new Date(2015, 5, 13, 20, 0, 0, 0),
				endTime: new Date(2015, 5, 14, 30, 0, 0),
				private: false
			};
			putRequest('/races/4edd40c86762e0fb12000001', race, 302, function(err, res) { // Id race1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 500 when race does not exist', function(done) {
			var race = {
				name: "Race 1 Aangepast",
				hasSpecificOrder: true,
				startTime: new Date(2015, 5, 13, 20, 0, 0, 0),
				endTime: new Date(2015, 5, 14, 30, 0, 0),
				private: false
			};
			putRequest('/races/blabla?apikey=test2', race, 500, function(err, res) { // AuthKey user2 (geen owner)
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			var race = {
				name: "Race 1 Aangepast",
				hasSpecificOrder: true,
				startTime: new Date(2015, 5, 13, 20, 0, 0, 0),
				endTime: new Date(2015, 5, 14, 30, 0, 0),
				private: false
			};
			putRequest('/races/4edd40c86762e0fb12000001?apikey=test2', race, 403, function(err, res) { // Id race1, authKey user2 (geen owner)
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			var race = {
				name: "Race 1 Aangepast",
				hasSpecificOrder: true,
				startTime: new Date(2015, 5, 13, 20, 0, 0, 0),
				endTime: new Date(2015, 5, 14, 30, 0, 0),
				private: false
			};
			putRequest('/races/4edd40c86762e0fb12000001?apikey=test', race, 200, function(err, res) { // Id race1, authKey user1 (owner)
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.name).to.equal("Race 1 Aangepast");
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			var race = {
				name: "Race 2 Aangepast",
				hasSpecificOrder: true,
				startTime: new Date(2015, 5, 13, 20, 0, 0, 0),
				endTime: new Date(2015, 5, 14, 30, 0, 0),
				private: false
			};
			putRequest('/races/4edd40c86762e0fb12000002?apikey=admin', race, 200, function(err, res) { // Id race2, authKey admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.name).to.equal("Race 2 Aangepast");
				
				done();
			});			
		});
		
	});
	
	describe('Delete race', function() {	

		// Reset data in de database
		getRequest('/data', 200, function(err, res) {});
		
		it('should return 302 when not logged in', function(done) {
			deleteRequest('/races/4edd40c86762e0fb12000004', 302, function(err, res) { // Id race4
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 500 when race does not exist', function(done) {
			deleteRequest('/races/blabla?apikey=test2', 500, function(err, res) { // AuthKey user2 (geen owner)
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			deleteRequest('/races/4edd40c86762e0fb12000004?apikey=test2', 403, function(err, res) { // Id race4, authKey user2 (geen owner)
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			deleteRequest('/races/4edd40c86762e0fb12000004?apikey=test', 200, function(err, res) { // Id race4, authKey user1 (owner)
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body._id).to.equal("4edd40c86762e0fb12000004"); // Id race4
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			deleteRequest('/races/4edd40c86762e0fb12000005?apikey=admin', 200, function(err, res) { // Id race5, authKey admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body._id).to.equal("4edd40c86762e0fb12000005"); // Id race5
				
				done();
			});			
		});
		
	});
	
	describe('Add owner', function() {	

		// Reset data in de database
		getRequest('/data', 200, function(err, res) {});
		
		it('should return 302 when not logged in', function(done) {
			putRequest('/races/4edd40c86762e0fb12000001/owner/555111e9e6051ea818f936e2', null, 302, function(err, res) { // Id race1, id user2
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 500 when race does not exist', function(done) {
			putRequest('/races/blabla/owner/555111e9e6051ea818f936e2?apikey=test3', null, 500, function(err, res) { // Id user2, authkKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			putRequest('/races/4edd40c86762e0fb12000001/owner/555111e9e6051ea818f936e2?apikey=test3', null, 403, function(err, res) { // Id race1, id user2, authkKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			putRequest('/races/4edd40c86762e0fb12000001/owner/555111e9e6051ea818f936e2?apikey=test', null, 200, function(err, res) { // Id race1, id user2, authkKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(3);
				expect(res.body.owners).to.include("555111e9e6051ea818f936e2"); // Id user2
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			putRequest('/races/4edd40c86762e0fb12000002/owner/555111e9e6051ea818f936e2?apikey=admin', null, 200, function(err, res) { // Id race2, id user2, authKey admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(3);
				expect(res.body.owners).to.include("555111e9e6051ea818f936e2"); // Id user2
				
				done();
			});			
		});
		
	});
	
	describe('Remove owner', function() {		
	
		// Reset data in de database
		getRequest('/data', 200, function(err, res) {});
		
		it('should return 302 when not logged in', function(done) {
			deleteRequest('/races/4edd40c86762e0fb12000001/owner/5edd40c86762e0fb12000004', 302, function(err, res) { // Id race1, id user4
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 500 when race does not exist', function(done) {
			deleteRequest('/races/blabla/owner/5edd40c86762e0fb12000004?apikey=test3', 500, function(err, res) { // Id user4, authkKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			deleteRequest('/races/4edd40c86762e0fb12000001/owner/5edd40c86762e0fb12000004?apikey=test3', 403, function(err, res) { // Id race1, id user4, authkKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			deleteRequest('/races/4edd40c86762e0fb12000001/owner/5edd40c86762e0fb12000004?apikey=test', 200, function(err, res) { // Id race1, id user4, authkKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(1);
				expect(res.body.owners).to.not.include("5edd40c86762e0fb12000004"); // Id user4
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			deleteRequest('/races/4edd40c86762e0fb12000002/owner/5edd40c86762e0fb12000004?apikey=admin', 200, function(err, res) { // Id race2, id user4, authKey admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(1);
				expect(res.body.owners).to.not.include("5edd40c86762e0fb12000004"); // Id user4
				
				done();
			});			
		});
		
	});
	
	/*describe('Add participant', function() {		
		
		it('should return 302 when not logged in', function(done) {
			putRequest('/races/55198f1a01a9a9e417213f34/participant', null, 302, function(err, res) { // Id eerste race
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when race does not exist', function(done) {
			putRequest('/races/11198f1a01a9a9e417213f34/participant?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', null, 404, function(err, res) { // Id GEEN bestaande race
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when logged in', function(done) {
			putRequest('/races/55198f1a01a9a9e417213f34/participant?apikey=2fe16885-ad75-4494-ad26-f13a3c4bf249', null, 200, function(err, res) { // Id eerste race
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return race with 1 participant', function(done) {
			putRequest('/races/55198f4401a9a9e417213f36/participant?apikey=7b6fcca7-71a4-4a12-9665-7a5def68c5d0', null, 200, function(err, res) { // Id tweede race
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.participants).to.have.length(1);
				expect(res.body.participants).to.include("551306645d24a5d810258e11"); // Id ingelogde user
				
				done();
			});			
		});
		
	});
	
	describe('Remove participant', function() {		
		
		it('should return 302 when not logged in', function(done) {
			deleteRequest('/races/55198f1a01a9a9e417213f34/participant', 302, function(err, res) { // Id eerste race
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when race does not exist', function(done) {
			deleteRequest('/races/11198f1a01a9a9e417213f34/participant?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', 404, function(err, res) { // Id GEEN bestaande race
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when logged in (without idParticipant)', function(done) {
			deleteRequest('/races/55198f1a01a9a9e417213f34/participant?apikey=2fe16885-ad75-4494-ad26-f13a3c4bf249', 200, function(err, res) { // Id eerste race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.participants).to.have.length(0);
				expect(res.body.participants).to.not.include("5519b30fe6c16434155d2948"); // Id ingelogde user
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			deleteRequest('/races/55198f1a01a9a9e417213f34/participant/5519ade99d7f6e240d256a8e?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', 403, function(err, res) { // Id tweede race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			deleteRequest('/races/55198f1a01a9a9e417213f34/participant/5519ade99d7f6e240d256a8e?apikey=2fe16885-ad75-4494-ad26-f13a3c4bf249', 200, function(err, res) { // Id tweede race, key user die OWNER is van de race en GEEN ADMIN
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.participants).to.have.length(0);
				expect(res.body.participants).to.not.include("5519ade99d7f6e240d256a8e"); // Meegegeven owner id
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			deleteRequest('/races/55198f4401a9a9e417213f36/participant/5519b5b272cbcd2c1f9e9c5e?apikey=7b6fcca7-71a4-4a12-9665-7a5def68c5d0', 200, function(err, res) { // Id derde race, key user die ADMIN is van de race en GEEN OWNER
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.participants).to.have.length(0);
				expect(res.body.participants).to.not.include("5519b5b272cbcd2c1f9e9c5e"); // Meegegeven owner id
				
				done();
			});			
		});
		
	});*/
	
	/*describe('Add location', function() {		
		
		it('should return 302 when not logged in', function(done) {
			var location = {
				orderPosition: 1, 
				location: "5516a17f30040ae8136ec591"
			};
			postRequest('/races/55198f1a01a9a9e417213f34/location', location, 302, function(err, res) { // Id eerste race
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when race does not exist', function(done) {
			var location = {
				orderPosition: 1, 
				location: "5516a17f30040ae8136ec591"
			};
			postRequest('/races/11198f1a01a9a9e417213f34/location?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', location, 404, function(err, res) { // Id GEEN bestaande race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			var location = {
				orderPosition: 1, 
				location: "5516a17f30040ae8136ec591"
			};
			postRequest('/races/55198f1a01a9a9e417213f34/location?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', location, 403, function(err, res) { // Id eerste race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			var location = {
				orderPosition: 1, 
				location: "5516a17f30040ae8136ec591"
			};
			postRequest('/races/55198f1a01a9a9e417213f34/location?apikey=2fe16885-ad75-4494-ad26-f13a3c4bf249', location, 200, function(err, res) { // Id eerste race, key user die OWNER is van de race en GEEN ADMIN
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.locations).to.have.length(1);
				expect(res.body.locations[1].location).to.equal("5516a17f30040ae8136ec591"); // Id location
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			var location = {
				orderPosition: 1, 
				location: "5516a17f30040ae8136ec591"
			};
			postRequest('/races/5519ade99d7f6e240d256a8e/owner/5519b30fe6c16434155d2948?apikey=7b6fcca7-71a4-4a12-9665-7a5def68c5d0', location, 200, function(err, res) { // Id tweede race, key user die ADMIN is van de race en GEEN OWNER
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.locations).to.have.length(1);
				expect(res.body.locations[1].location).to.equal("5516a17f30040ae8136ec591"); // Id location
				
				done();
			});			
		});
		
	});*/
	
});
