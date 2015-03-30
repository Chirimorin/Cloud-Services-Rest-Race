/**
 * Created by Thomas on 27-3-2015.
 */

var request = require('supertest');
var expect = require('chai').expect;
var should = require('chai').should();

var app = require('../app');

var User = require('mongoose').model('User');

