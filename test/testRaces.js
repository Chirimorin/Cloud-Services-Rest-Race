var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('../app');
var User = require('mongoose').model('User');

function getRequest(route, statusCode, done) {
	request(app)
		.get(route)
		.set('Accept', 'application/json')
		.expect(statusCode)
		.end(function(err, res) {
			if(err){ return done(err); }

			done(null, res);
		});
};

function postRequest(route, data, statusCode, done) {
	request(app)
		.post(route)
		.set('Accept', 'application/json')
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
		.set('Accept', 'application/json')
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
		.set('Accept', 'application/json')
		.expect(statusCode)
		.end(function(err, res) {
			if(err){ return done(err); }

			done(null, res);
		});
};

describe('Testing races route', function() {
	
	describe('Get all races', function() {

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 302 when not logged in', function(done) {
			getRequest('/races', 302, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 5 races for owner request', function(done) {
			getRequest('/races?type=owner&apikey=test', 200, function(err, res) { // AuthKey user1
				if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body).to.have.length(5);
				
				done();
			});
		});

        it('should return 0 races for owner request when not an owner', function(done) {
            getRequest('/races?type=owner&apikey=test2', 200, function(err, res) { // AuthKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body).to.have.length(0);

                done();
            });
        });

        it('should return 5 public races for owner request', function(done) {
            getRequest('/races?type=public&apikey=test', 200, function(err, res) { // AuthKey user1
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body).to.have.length(5);

                done();
            });
        });

        it('should return 5 public races for non-owner request', function(done) {
            getRequest('/races?type=public&apikey=test2', 200, function(err, res) { // AuthKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body).to.have.length(5);

                done();
            });
        });

        it('should return 2 public races with pageSize=2', function(done) {
            getRequest('/races?type=public&pageSize=2&apikey=test', 200, function(err, res) { // AuthKey user1
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body).to.have.length(2);

                done();
            });
        });

        it('should return 2 public races with pageSize=2 and page=2', function(done) {
            getRequest('/races?type=public&pageSize=2&page=2&apikey=test', 200, function(err, res) { // AuthKey user1
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body).to.have.length(2);

                done();
            });
        });

        it('should return 0 participating races for a non-participating user.', function(done) {
            getRequest('/races?type=participant&apikey=test', 200, function(err, res) { // AuthKey user1
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body).to.have.length(0);

                done();
            });
        });

        it('should return 5 participating races for a participating user.', function(done) {
            getRequest('/races?type=participant&apikey=test2', 200, function(err, res) { // AuthKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body).to.have.length(5);

                done();
            });
        });

        it('should return 200 when logged in', function(done) {
            getRequest('/races?apikey=test', 200, function(err, res) { // AuthKey user1
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body).to.have.length(5);

                done();
            });
        });
	});
	
	describe('Get race by ID', function() {

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 302 when not logged in', function(done) {
			getRequest('/races/300000000000000000000001', 302, function(err, res) { // Id race1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when logged in', function(done) {
			getRequest('/races/300000000000000000000001?apikey=test', 200, function(err, res) { // Id race1, authKey user1
				if(err){ return done(err); }
				
				done();
			});
		});
		
		it('should return a race', function(done) {
			getRequest('/races/300000000000000000000001?apikey=test', 200, function(err, res) { // Id race1, authKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body._id).to.equal("300000000000000000000001"); // Id race1
					
				done();
			});	
		});
		
		it('should return 404 when objectId is invalid', function(done) { // AuthKey user1
			getRequest('/races/blabla?apikey=test', 404, function(err, res) {
				if(err){ return done(err); }
				
				done();
			});			
		});

        it('should return 404 when race does not exist', function(done) { // AuthKey user1
            getRequest('/races/800000000000000000000001?apikey=test', 404, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
	});
	
	describe('Add race', function() {

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
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
		
		it('should return 400 when race data is wrong', function(done) {
			var race = {
				hasSpecificOrder: false,
				startTime: new Date(2015, 5, 11, 20, 0, 0, 0),
				private: false
			};
			postRequest('/races?apikey=test', race, 400, function(err, res) { // AuthKey user1
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

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 302 when not logged in', function(done) {
			var race = {
				name: "Race 1 Aangepast",
				hasSpecificOrder: true,
				startTime: new Date(2015, 5, 13, 20, 0, 0, 0),
				endTime: new Date(2015, 5, 14, 30, 0, 0),
				private: false
			};
			putRequest('/races/300000000000000000000001', race, 302, function(err, res) { // Id race1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when objectId is invalid', function(done) {
			var race = {
				name: "Race 1 Aangepast",
				hasSpecificOrder: true,
				startTime: new Date(2015, 5, 13, 20, 0, 0, 0),
				endTime: new Date(2015, 5, 14, 30, 0, 0),
				private: false
			};
			putRequest('/races/blabla?apikey=test2', race, 404, function(err, res) { // AuthKey user2 (geen owner)
				if(err){ return done(err); }
				
				done();
			});			
		});

        it('should return 404 when race does not exist', function(done) {
            var race = {
                name: "Race 1 Aangepast",
                hasSpecificOrder: true,
                startTime: new Date(2015, 5, 13, 20, 0, 0, 0),
                endTime: new Date(2015, 5, 14, 30, 0, 0),
                private: false
            };
            putRequest('/races/800000000000000000000001?apikey=test2', race, 404, function(err, res) { // AuthKey user2 (geen owner)
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
			putRequest('/races/300000000000000000000001?apikey=test2', race, 403, function(err, res) { // Id race1, authKey user2 (geen owner)
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
			putRequest('/races/300000000000000000000001?apikey=test', race, 200, function(err, res) { // Id race1, authKey user1 (owner)
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
            putRequest('/races/300000000000000000000002?apikey=admin', race, 200, function(err, res) { // Id race2, authKey admin
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.name).to.equal("Race 2 Aangepast");

                done();
            });
        });

        it('should return 200 when no end time is given', function(done) {
            var race = {
                name: "Race 3 Aangepast",
                hasSpecificOrder: true,
                startTime: new Date(2015, 5, 13, 20, 0, 0, 0),
                private: false
            };
            putRequest('/races/300000000000000000000003?apikey=test', race, 200, function(err, res) { // Id race3, authKey user1 (owner)
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.name).to.equal("Race 3 Aangepast");

                done();
            });
        });

        it('should return 400 when data is invalid', function(done) {
            var race = {
                name: "Race 2 Aangepast",
                hasSpecificOrder: true,
                startTime: "geen datum",
                endTime: new Date(2015, 5, 14, 30, 0, 0),
                private: false
            };
            putRequest('/races/300000000000000000000002?apikey=admin', race, 400, function(err, res) { // Id race2, authKey admin
                if(err){ return done(err); }

                done();
            });
        });
		
	});
	
	describe('Delete race', function() {

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 302 when not logged in', function(done) {
			deleteRequest('/races/300000000000000000000004', 302, function(err, res) { // Id race4
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when objectId is invalid', function(done) {
			deleteRequest('/races/blabla?apikey=test2', 404, function(err, res) { // AuthKey user2 (geen owner)
				if(err){ return done(err); }
				
				done();
			});			
		})

        it('should return 404 when race does not exist', function(done) {
            deleteRequest('/races/800000000000000000000004?apikey=test2', 404, function(err, res) { // AuthKey user2 (geen owner)
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 403 when user is not owner and not admin', function(done) {
			deleteRequest('/races/300000000000000000000004?apikey=test2', 403, function(err, res) { // Id race4, authKey user2 (geen owner)
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			deleteRequest('/races/300000000000000000000004?apikey=test', 200, function(err, res) { // Id race4, authKey user1 (owner)
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body._id).to.equal("300000000000000000000004"); // Id race4
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			deleteRequest('/races/300000000000000000000005?apikey=admin', 200, function(err, res) { // Id race5, authKey admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body._id).to.equal("300000000000000000000005"); // Id race5
				
				done();
			});			
		});
		
	});
	
	describe('Add owner', function() {

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 302 when not logged in', function(done) {
			putRequest('/races/300000000000000000000001/owner/100000000000000000000003', null, 302, function(err, res) { // Id race1, id user2
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when objectId is invalid', function(done) {
			putRequest('/races/blabla/owner/100000000000000000000003?apikey=test3', null, 404, function(err, res) { // Id user2, authkKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});

        it('should return 404 when race does not exist', function(done) {
            putRequest('/races/800000000000000000000001/owner/100000000000000000000003?apikey=test3', null, 404, function(err, res) { // Id user2, authkKey user3
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 403 when user is not owner and not admin', function(done) {
			putRequest('/races/300000000000000000000001/owner/100000000000000000000003?apikey=test3', null, 403, function(err, res) { // Id race1, id user2, authkKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			putRequest('/races/300000000000000000000001/owner/100000000000000000000003?apikey=test', null, 200, function(err, res) { // Id race1, id user2, authkKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(3);
				expect(res.body.owners).to.include("100000000000000000000003"); // Id user2
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			putRequest('/races/300000000000000000000002/owner/100000000000000000000003?apikey=admin', null, 200, function(err, res) { // Id race2, id user2, authKey admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(3);
				expect(res.body.owners).to.include("100000000000000000000003"); // Id user2
				
				done();
			});			
		});

        it('should return 200 when added user is already admin', function(done) {
            putRequest('/races/300000000000000000000002/owner/100000000000000000000003?apikey=admin', null, 200, function(err, res) { // Id race2, id user2, authKey admin
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.owners).to.have.length(3);
                expect(res.body.owners).to.include("100000000000000000000003"); // Id user2

                done();
            });
        });
		
	});
	
	describe('Remove owner', function() {		
	
		// Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 302 when not logged in', function(done) {
			deleteRequest('/races/300000000000000000000001/owner/100000000000000000000005', 302, function(err, res) { // Id race1, id user4
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when objectId is invalid', function(done) {
			deleteRequest('/races/blabla/owner/100000000000000000000005?apikey=test3', 404, function(err, res) { // Id user4, authkKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});

        it('should return 404 when race does not exist', function(done) {
            deleteRequest('/races/800000000000000000000001/owner/100000000000000000000005?apikey=test3', 404, function(err, res) { // Id user4, authkKey user3
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 403 when user is not owner and not admin', function(done) {
			deleteRequest('/races/300000000000000000000001/owner/100000000000000000000005?apikey=test3', 403, function(err, res) { // Id race1, id user4, authkKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			deleteRequest('/races/300000000000000000000001/owner/100000000000000000000005?apikey=test', 200, function(err, res) { // Id race1, id user4, authkKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(1);
				expect(res.body.owners).to.not.include("100000000000000000000005"); // Id user4
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			deleteRequest('/races/300000000000000000000002/owner/100000000000000000000005?apikey=admin', 200, function(err, res) { // Id race2, id user4, authKey admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.owners).to.have.length(1);
				expect(res.body.owners).to.not.include("100000000000000000000005"); // Id user4
				
				done();
			});			
		});

        it('should return 404 when given user is not an owner', function(done) {
            deleteRequest('/races/300000000000000000000001/owner/100000000000000000000005?apikey=test', 404, function(err, res) { // Id race1, id user4, authkKey user1
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.message).to.equal("Gebruiker is geen eigenaar van deze race.");
                expect(res.body.owners).to.not.include("100000000000000000000005"); // Id user4

                done();
            });
        });
		
	});
	
	describe('Add participant', function() {

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 302 when not logged in', function(done) {
			putRequest('/races/300000000000000000000001/participant', null, 302, function(err, res) { // Id race1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when race does not exist', function(done) {
			putRequest('/races/blabla/participant?apikey=test', null, 404, function(err, res) { // AuthKey user1
				if(err){ return done(err); }
				
				done();
			});			
		});

        it('should return 404 when race does not exist', function(done) {
            putRequest('/races/800000000000000000000001/participant?apikey=test', null, 404, function(err, res) { // AuthKey user1
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 200 when logged in', function(done) {
			putRequest('/races/300000000000000000000001/participant?apikey=test', null, 200, function(err, res) { // Id race1, authKey user1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return race with 1 participant', function(done) {
			putRequest('/races/300000000000000000000002/participant?apikey=test', null, 200, function(err, res) { // Id race2, authKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.participants).to.have.length(2);
				expect(res.body.participants).to.include("100000000000000000000002"); // Id user1
				
				done();
			});			
		});
		
	});
	
	describe('Remove participant', function() {

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 302 when not logged in', function(done) {
			deleteRequest('/races/300000000000000000000001/participant', 302, function(err, res) { // Id race1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when objectId is invalid', function(done) {
			deleteRequest('/races/blabla/participant?apikey=test', 404, function(err, res) { // AuthKey user1
				if(err){ return done(err); }
				
				done();
			});			
		});

        it('should return 404 when race does not exist', function(done) {
            deleteRequest('/races/800000000000000000000001/participant?apikey=test', 404, function(err, res) { // AuthKey user1
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 404 when user is not in the race', function(done) {
            deleteRequest('/races/300000000000000000000001/participant?apikey=test', 404, function(err, res) { // Id race1, authKey user1
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 200 when logged in (without idParticipant)', function(done) {
			deleteRequest('/races/300000000000000000000001/participant?apikey=test2', 200, function(err, res) { // Id race1, authKey user2
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.participants).to.have.length(0);
				expect(res.body.participants).to.not.include("100000000000000000000003"); // Id user2
				
				done();
			});			
		});
		
		it('should return 403 when user is not owner and not admin', function(done) {
			deleteRequest('/races/300000000000000000000001/participant/100000000000000000000003?apikey=test3', 403, function(err, res) { // Id race1, id user2, authKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});

        it('should return 404 when user is owner but user is not a participant', function(done) {
            deleteRequest('/races/300000000000000000000002/participant/100000000000000000000002?apikey=test', 404, function(err, res) { // Id race2, id user2, authKey user1
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 200 when user is owner', function(done) {
			deleteRequest('/races/300000000000000000000002/participant/100000000000000000000003?apikey=test', 200, function(err, res) { // Id race2, id user2, authKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.participants).to.have.length(0);
				expect(res.body.participants).to.not.include("100000000000000000000003"); // Id user2
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			deleteRequest('/races/300000000000000000000003/participant/100000000000000000000003?apikey=admin', 200, function(err, res) { // Id race3, id user2, authKey admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.participants).to.have.length(0);
				expect(res.body.participants).to.not.include("100000000000000000000003"); // Id user2
				
				done();
			});			
		});
		
	});
	
	describe('Add location', function() {

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 302 when not logged in', function(done) {
			var waypoint = { 
				location: {
					name: "Location 3",
					lat: 1.0,
					long: 2.0,
					distance: 3.0
				}
			};
			postRequest('/races/300000000000000000000001/location', waypoint, 302, function(err, res) { // Id race1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when objectId is invalid', function(done) {
			var waypoint = { 
				location: {
					name: "Location 3",
					lat: 1.0,
					long: 2.0,
					distance: 3.0
				}
			};
			postRequest('/races/blabla/location?apikey=test3', waypoint, 404, function(err, res) { // AuthKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});

        it('should return 404 when race does not exist', function(done) {
            var waypoint = {
                location: {
                    name: "Location 3",
                    lat: 1.0,
                    long: 2.0,
                    distance: 3.0
                }
            };
            postRequest('/races/800000000000000000000001/location?apikey=test3', waypoint, 404, function(err, res) { // AuthKey user3
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 403 when user is not owner and not admin', function(done) {
			var waypoint = { 
				location: {
					name: "Location 3",
					lat: 1.0,
					long: 2.0,
					distance: 3.0
				}
			};
			postRequest('/races/300000000000000000000001/location?apikey=test3', waypoint, 403, function(err, res) { // Id race1, authKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			var waypoint = { 
				location: {
					name: "Location 3",
					lat: 1.0,
					long: 2.0,
					distance: 3.0
				}
			};
			postRequest('/races/300000000000000000000001/location?apikey=test', waypoint, 200, function(err, res) { // Id race1, authKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.locations).to.have.length(3);
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			var waypoint = { 
				location: {
					name: "Location 3",
					lat: 1.0,
					long: 2.0,
					distance: 3.0,
                    description: "Description goes here"
				}
			};
			postRequest('/races/300000000000000000000002/location?apikey=admin', waypoint, 200, function(err, res) { // Id race2, authKey admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.locations).to.have.length(3);
				
				done();
			});			
		});

        it('should return 400 when location data is incorrect.', function(done) {
            var waypoint = {
                location: {
                    lat: 1.0,
                    long: 2.0,
                    distance: 3.0
                }
            };
            postRequest('/races/300000000000000000000001/location?apikey=test', waypoint, 400, function(err, res) { // Id race1, authKey user1
                if(err){ return done(err); }

                done();
            });
        });
		
	});
	
	describe('Delete location', function() {

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 302 when not logged in', function(done) {
			deleteRequest('/races/300000000000000000000001/location/200000000000000000000011', 302, function(err, res) { // Id race1, Id waypoint location1 bij race1
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 404 when objectId is invalid', function(done) {
			deleteRequest('/races/blabla/location/200000000000000000000011?apikey=test3', 404, function(err, res) { // Id waypoint location1 bij race1, authKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});

        it('should return 404 when race does not exist', function(done) {
            deleteRequest('/races/800000000000000000000001/location/200000000000000000000011?apikey=test3', 404, function(err, res) { // Id waypoint location1 bij race1, authKey user3
                if(err){ return done(err); }

                done();
            });
        });
		
		it('should return 403 when user is not owner and not admin', function(done) {
			deleteRequest('/races/300000000000000000000001/location/200000000000000000000011?apikey=test3', 403, function(err, res) { // Id race1, id waypoint location1 bij race1, authKey user3
				if(err){ return done(err); }
				
				done();
			});			
		});
		
		it('should return 200 when user is owner', function(done) {
			deleteRequest('/races/300000000000000000000001/location/200000000000000000000011?apikey=test', 200, function(err, res) { // Id race1, id waypoint location1 bij race1, authKey user1
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.locations).to.have.length(1);
				
				done();
			});			
		});
		
		it('should return 200 when user is admin', function(done) {
			deleteRequest('/races/300000000000000000000002/location/200000000000000000000021?apikey=admin', 200, function(err, res) { // Id race2, id waypoint location1 bij race2, authKey admin
				if(err){ return done(err); }
				
				expect(res.body).to.not.be.undefined;
				expect(res.body.locations).to.have.length(1);
				
				done();
			});			
		});
		
	});

    describe('Check in', function() {

        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function (done) {
            getRequest('/data', 200, function (err, res) {
                if (err) {
                    return done(err);
                }

                done();
            });
        });

        it('should return 403 when user 3 checks in to race 1', function(done) {
            putRequest('/races/300000000000000000000001/location/1/2?apikey=test3', {}, 403, function(err, res) { // Id race1, authKey user3
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.message).to.equal("Je doet niet mee aan deze race");

                done();
            });
        });

        it('should return 200 when checking in to race 1', function(done) {
            putRequest('/races/300000000000000000000001/location/1/2?apikey=test2', {}, 200, function(err, res) { // Id race1, authKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.checkedIn).to.equal(true);
                expect(res.body.locations.length).to.equal(2);

                done();
            });
        });

        it('should not check in if already checked in', function(done) {
            putRequest('/races/300000000000000000000001/location/1/2?apikey=test2', {}, 200, function(err, res) { // Id race1, authKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.checkedIn).to.equal(false);
                expect(res.body.locations.length).to.equal(2);

                done();
            });
        });

        it('should not check in with wrong coordinates', function(done) {
            putRequest('/races/300000000000000000000001/location/3/4?apikey=test2', {}, 200, function(err, res) { // Id race1, authKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.checkedIn).to.equal(false);
                expect(res.body.locations.length).to.equal(2);

                done();
            });
        });

        it('should return 400 when checking in to race 3', function(done) {
            putRequest('/races/300000000000000000000003/location/1/2?apikey=test2', {}, 200, function(err, res) { // Id race1, authKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.message).to.equal("Race is nog niet gestart! Probeer het later nog eens.");

                done();
            });
        });

        it('should return 200 when checking in to race 2', function(done) {
            putRequest('/races/300000000000000000000002/location/1/2?apikey=test2', {}, 200, function(err, res) { // Id race2, authKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.checkedIn).to.equal(true);
                expect(res.body.locations.length).to.equal(4);

                done();
            });
        });

        it('should return 200 when leaving race', function(done) {
            deleteRequest('/races/300000000000000000000001/participant?apikey=test2', 200, function(err, res) { // Id race1, authKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.participants).to.have.length(0);
                expect(res.body.participants).to.not.include("100000000000000000000003"); // Id user2

                done();
            });
        });

        it('should return 404 when objectId is invalid', function(done) {
            putRequest('/races/blabla/location/1/2?apikey=test2', {}, 404, function(err, res) { // Id race1, authKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.message).to.equal("Race niet gevonden");

                done();
            });
        });

        it('should return 404 when race does not exist', function(done) {
            putRequest('/races/800000000000000000000001/location/1/2?apikey=test2', {}, 404, function(err, res) { // Id race1, authKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.message).to.equal("Race niet gevonden");

                done();
            });
        });

        it('should return 400 when incorrect lat/long are given', function(done) {
            putRequest('/races/300000000000000000000002/location/test/2?apikey=test2', {}, 400, function(err, res) { // Id race2, authKey user2
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;

                done();
            });
        });

    });
	
});
