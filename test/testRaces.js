var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('../app');
var Race = require('mongoose').model('Race');

function makeRequest(route, statusCode, done) {
	request(app)
		.get(route)
		.expect(statusCode)
		.end(function(err, res) {
			if(err){ return done(err); }

			done(null, res);
		});
};

describe('Testing races route', function(){
	it('test bla bla');
});
