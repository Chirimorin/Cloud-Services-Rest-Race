var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('../app');
var User = require('mongoose').model('User');

function getRequest(route, statusCode, done) {
	request(app)
		.get(route)
		.expect(statusCode)
		.end(function(err, res) {
			if(err){ return done(err); }

			done(null, res);
		});
};

function postRequest(route, data, statusCode, done) {
	request(app)
		.post(route)
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
		.expect(statusCode)
		.end(function(err, res) {
			if(err){ return done(err); }

			done(null, res);
		});
};

describe('Testing races route', function() {
	
	describe('Get all races', function() {
		
		it('should return 302 when not logged in', function(done) {
			getRequest('/races', 302, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when logged in', function(done) {
			getRequest('/races?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', 200, function(err, res) { // Key gewone user, geen admin
				if(err){ return done(err); }
				
				done();
			});
		});
		
		it('should return 5 races', function(done) {
			getRequest('/races?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', 200, function(err, res) { // Key gewone user, geen admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body).to.have.length(5);
					
				done();
			});	
		});	
		
	});
	
	describe('Get race by ID', function() {
		
		it('should return 302 when not logged in', function(done) {
			getRequest('/races/55198f1a01a9a9e417213f34', 302, function(err, res) { // Id eerste race
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when logged in', function(done) {
			getRequest('/races/55198f1a01a9a9e417213f34?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', 200, function(err, res) { // Id eerste race, key gewone user, geen admin
				if(err){ return done(err); }
				
				done();
			});
		});
		
		it('should return a race', function(done) {
			getRequest('/races/55198f1a01a9a9e417213f34?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', 200, function(err, res) { // Id eerste race, key gewone user, geen admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body._id).to.equal("55198f1a01a9a9e417213f34"); // Id eerste race
					
				done();
			});	
		});
		
	});
	
	describe('Add race', function() {		
		
		it('should return 302 when not logged in', function(done) {
			var race = {
				name: "Race 6",
				hasSpecificOrder: false,
				startTime: "2015-03-30 20:00",
				private: true
			};
			postRequest('/races', race, 302, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 201 when logged in', function(done) {
			var race = {
				name: "Race 6",
				hasSpecificOrder: false,
				startTime: "2015-03-30 20:00",
				private: true
			};
			postRequest('/races?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', race, 201, function(err, res) { // Key gewone user, geen admin
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return new race', function(done) {
			var race = {
				name: "Race 7",
				hasSpecificOrder: false,
				startTime: "2015-03-30 20:00",
				endTime: "2015-03-31 03:30",
				private: true
			};
			postRequest('/races?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', race, 201, function(err, res) { // Key gewone user, geen admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.name).to.equal("Race 7");
				
				done();
			});			
		});
		
	});
	
	describe('Update race', function() {		
		
		it('should return 302 when not logged in', function(done) {
			var race = {
				name: "Race 1 Aangepast",
				hasSpecificOrder: true,
				startTime: "2015-03-31 20:00",
				private: false
			};
			putRequest('/races/55198f1a01a9a9e417213f34', race, 302, function(err, res) { // Id eerste race
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when race does not exist', function(done) {
			var race = {
				name: "Race 1 Aangepast",
				hasSpecificOrder: true,
				startTime: "2015-03-31 20:00",
				private: false
			};
			putRequest('/races/11198f1a01a9a9e417213f34?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', race, 404, function(err, res) { // Id GEEN bestaande race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			var race = {
				name: "Race 1 Aangepast",
				hasSpecificOrder: true,
				startTime: "2015-03-31 20:00",
				private: false
			};
			putRequest('/races/55198f1a01a9a9e417213f34?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', race, 403, function(err, res) { // Id eerste race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			var race = {
				name: "Race 1 Aangepast",
				hasSpecificOrder: true,
				startTime: "2015-03-31 20:00",
				private: false
			};
			putRequest('/races/55198f1a01a9a9e417213f34?apikey=2fe16885-ad75-4494-ad26-f13a3c4bf249', race, 200, function(err, res) { // Id eerste race, key user die OWNER is van de race en GEEN ADMIN
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
				startTime: "2015-03-31 20:00",
				private: false
			};
			putRequest('/races/55198f3a01a9a9e417213f35?apikey=7b6fcca7-71a4-4a12-9665-7a5def68c5d0', race, 200, function(err, res) { // Id tweede race, key user die ADMIN is van de race en GEEN OWNER
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.name).to.equal("Race 2 Aangepast");
				
				done();
			});			
		});
		
	});
	
	/*describe('Delete race', function() {		
		
		it('should return 302 when not logged in', function(done) {
			deleteRequest('/races/5519ae2a9d7f6e240d256a8f', 302, function(err, res) { // Id vierde race
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when race does not exist', function(done) {
			deleteRequest('/races/11198f1a01a9a9e417213f34?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', 404, function(err, res) { // Id GEEN bestaande race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			deleteRequest('/races/5519ae2a9d7f6e240d256a8f?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', 403, function(err, res) { // Id vierde race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			deleteRequest('/races/5519ae2a9d7f6e240d256a8f?apikey=2fe16885-ad75-4494-ad26-f13a3c4bf249', 200, function(err, res) { // Id vierde race, key user die OWNER is van de race en GEEN ADMIN
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body._id).to.equal("5519ae2a9d7f6e240d256a8f"); // Id vierde race
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			deleteRequest('/races/5519b073c3367dec022c516d?apikey=7b6fcca7-71a4-4a12-9665-7a5def68c5d0', 200, function(err, res) { // Id vijfde race, key user die ADMIN is van de race en GEEN OWNER
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body._id).to.equal("5519b073c3367dec022c516d"); // Id vijfde race
				
				done();
			});			
		});
		
	});*/
	
	describe('Add owner', function() {		
		
		it('should return 302 when not logged in', function(done) {
			putRequest('/races/55198f1a01a9a9e417213f34/owner/5519afa13eaee7240daa1f51', null, 302, function(err, res) { // Id eerste race, id owner = gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when race does not exist', function(done) {
			putRequest('/races/11198f1a01a9a9e417213f34/owner/5519afa13eaee7240daa1f51?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', null, 404, function(err, res) { // Id GEEN bestaande race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			putRequest('/races/55198f1a01a9a9e417213f34/owner/5519afa13eaee7240daa1f51?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', null, 403, function(err, res) { // Id eerste race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			putRequest('/races/55198f1a01a9a9e417213f34/owner/5519afa13eaee7240daa1f51?apikey=2fe16885-ad75-4494-ad26-f13a3c4bf249', null, 200, function(err, res) { // Id eerste race, key user die OWNER is van de race en GEEN ADMIN
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(2);
				expect(res.body.owners).to.include("5519afa13eaee7240daa1f51"); // Meegegeven owner id
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			putRequest('/races/55198f4401a9a9e417213f36/owner/5519b30fe6c16434155d2948?apikey=7b6fcca7-71a4-4a12-9665-7a5def68c5d0', null, 200, function(err, res) { // Id tweede race, key user die ADMIN is van de race en GEEN OWNER
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(2);
				expect(res.body.owners).to.include("5519b30fe6c16434155d2948"); // Meegegeven owner id
				
				done();
			});			
		});
		
	});
	
	describe('Remove owner', function() {		
		
		it('should return 302 when not logged in', function(done) {
			deleteRequest('/races/55198f1a01a9a9e417213f34/owner/5519afa13eaee7240daa1f51', 302, function(err, res) { // Id eerste race, id owner = gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when race does not exist', function(done) {
			var race;
			deleteRequest('/races/11198f1a01a9a9e417213f34/owner/5519afa13eaee7240daa1f51?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', 404, function(err, res) { // Id GEEN bestaande race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			deleteRequest('/races/55198f1a01a9a9e417213f34/owner/5519afa13eaee7240daa1f51?apikey=fd29427d-ed40-4c52-b3b5-1e74bfaed104', 403, function(err, res) { // Id eerste race, key gewone user, geen admin, geen owner
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			deleteRequest('/races/55198f1a01a9a9e417213f34/owner/5519afa13eaee7240daa1f51?apikey=2fe16885-ad75-4494-ad26-f13a3c4bf249', 200, function(err, res) { // Id eerste race, key user die OWNER is van de race en GEEN ADMIN
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(1);
				expect(res.body.owners).to.not.include("5519afa13eaee7240daa1f51"); // Meegegeven owner id
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			deleteRequest('/races/55198f4401a9a9e417213f36/owner/5519b30fe6c16434155d2948?apikey=7b6fcca7-71a4-4a12-9665-7a5def68c5d0', 200, function(err, res) { // Id tweede race, key user die ADMIN is van de race en GEEN OWNER
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(1);
				expect(res.body.owners).to.not.include("5519b30fe6c16434155d2948"); // Meegegeven owner id
				
				done();
			});			
		});
		
	});
	
	describe('Add participant', function() {		
		
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
		
	});
	
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
