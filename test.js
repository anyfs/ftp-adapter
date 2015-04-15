'use strict';

var AnyFS = require('anyfs');
var test = require('anyfs').test;
var Adapter = require('./');

var Server = require('ftp-test-server');
var server = new Server();

server.init({
    user: "test",
    pass: "test",
    port: 3334,
});

var adapter = new Adapter({
    host: "localhost",
    user: "test",
    pass: "test",
    port: 3334,
});

var fs = new AnyFS(adapter);

AnyFS.test(fs);