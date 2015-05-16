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

function deleteRequest(route, data, statusCode, done) {
    request(app)
        .delete(route)
        .set('Accept', 'application/json')
        .send(data)
        .expect(statusCode)
        .end(function(err, res) {
            if(err){ return done(err); }

            done(null, res);
        });
};

describe('Testing login route', function() {
    var oldApikey;
    var newApiKey;


    describe('register and login user', function() {
        // Reset data in de database.
        // Dit is een test case omdat anders de tests uit worden gevoerd voor de data reset klaar is.
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 302 when passing an incorrect email', function(done) {
            var user = {
                email: "thisIsNoEmail",
                password: "none"
            };
            postRequest('/signup', user, 302, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 302 when not passing required data.', function(done) {
            var user = {
                email: "email@example.com"
            };
            postRequest('/signup', user, 302, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 200 when signing up', function(done) {
            var user = {
                email: "e@mail.com",
                password: "none"
            };
            postRequest('/signup', user, 200, function(err, res) {
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.authKey).to.not.be.undefined;

                oldApikey = res.body.authKey;

                done();
            });
        });

        it('should return 302 when signing up with the same e-mail', function(done) {
            var user = {
                email: "e@mail.com",
                password: "none"
            };
            postRequest('/signup', user, 302, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 200 when logging in', function(done) {
            var user = {
                email: "e@mail.com",
                password: "none"
            };
            postRequest('/login', user, 200, function(err, res) {
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.authKey).to.not.be.undefined;

                expect(res.body.authKey).to.equal(oldApikey);

                done();
            });
        });

        it('should return 302 when logging in with incorrect data', function(done) {
            var user = {
                email: "e@mail.com",
                password: "wrong"
            };
            postRequest('/login', user, 302, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 302 when logging out', function(done) {
            getRequest('/logout?apikey=' + oldApikey, 302, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 302 when logging out while not logged in', function(done) {
            getRequest('/logout', 302, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should have a different authKey when logging in again', function(done) {
            var user = {
                email: "e@mail.com",
                password: "none"
            };
            postRequest('/login', user, 200, function(err, res) {
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.authKey).to.not.be.undefined;

                expect(res.body.authKey).to.not.equal(oldApikey);

                newApiKey = res.body.authKey;

                done();
            });
        });

        it('should return 302 when using the old apikey', function(done) {
            getRequest('/races?apikey=' + oldApikey, 302, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

    });

    describe('Testing user functions', function() {
        it('should have status 200 for the data reset', function(done) {
            getRequest('/data', 200, function (err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 302 when getting users while not logged in', function(done) {
            getRequest('/users', 302, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 403 when getting users with a non-admin login', function(done) {
            getRequest('/users?apikey=test', 403, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 200 when getting users as admin', function(done) {
            getRequest('/users?apikey=admin', 200, function(err, res) {
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.length).to.equal(5);

                done();
            });
        });

        it('should return 200 when setting a nickname', function(done) {
            putRequest('/users/nickname?apikey=test', { nickname: "testNickname" }, 200, function(err, res) {
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.message).to.equal("Nickname succesvol aangepast.");

                done();
            });
        });

        it('should return 200 when setting an empty nickname', function(done) {
            putRequest('/users/nickname?apikey=test', { nickname: "" }, 200, function(err, res) {
                if(err){ return done(err); }

                expect(res.body).to.not.be.undefined;
                expect(res.body.message).to.equal("Nickname succesvol aangepast.");

                done();
            });
        });

        it('should return 403 when setting a nickname as non-admin', function(done) {
            putRequest('/users/100000000000000000000005/nickname?apikey=test', { nickname: "testNickname" }, 403, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 403 when trying to add user roles as non-admin', function(done) {
            postRequest('/users/100000000000000000000005/roles?apikey=test', { role: "admin" }, 403, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 403 when trying to delete user roles as non-admin', function(done) {
            postRequest('/users/100000000000000000000001/roles?apikey=test', { role: "admin" }, 403, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 200 when trying to add user roles as admin', function(done) {
            postRequest('/users/100000000000000000000002/roles?apikey=admin', { role: "admin" }, 200, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 404 when trying to add user roles to nonexisting user', function(done) {
            postRequest('/users/800000000000000000000002/roles?apikey=admin', { role: "admin" }, 404, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 200 when setting a nickname as (new) admin', function(done) {
            putRequest('/users/100000000000000000000005/nickname?apikey=test', { nickname: "testNickname" }, 200, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 200 when trying to delete user roles as admin', function(done) {
            deleteRequest('/users/100000000000000000000002/roles?apikey=admin', { role: "admin" }, 200, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 403 when trying to delete user roles as (once again) non-admin', function(done) {
            postRequest('/users/100000000000000000000001/roles?apikey=test', { role: "admin" }, 403, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

        it('should return 404 when trying to delete user roles from a nonexisting user', function(done) {
            deleteRequest('/users/800000000000000000000002/roles?apikey=admin', { role: "admin" }, 404, function(err, res) {
                if(err){ return done(err); }

                done();
            });
        });

    });
});


describe('Testing findLocation route', function() {
    it('should get location info', function(done) {
        getRequest('/locationInfo?query=Avans Hogeschool', 200, function (err, res) {
            if(err){ return done(err); }

            expect(res.body).to.not.be.undefined;
            expect(res.body.address).to.not.be.undefined;
            expect(res.body.lat).to.not.be.undefined;
            expect(res.body.long).to.not.be.undefined;


            done();
        });
    });

    it('should return 400 when no query is given.', function(done) {
        getRequest('/locationInfo', 400, function (err, res) {
            if(err){ return done(err); }

            done();
        });
    });
});