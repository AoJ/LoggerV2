var express = require('express');
var app = express.createServer();
var http = require('http');
var fs = require('fs');
var async = require('async');
var Data = require('data');
var _ = require('underscore');

// App Config
var config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'));
var seed = JSON.parse(fs.readFileSync(__dirname+ '/db/schema.json', 'utf-8'));

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(__dirname+"/public", { maxAge: 41 }));
});

app.listen(8276);

app.get('/log', function(req, res){
	res.writeHead(200);
	res.end(req.url);
	everyone.now.receiveLog(req.url, 'log');
	everyone.now.receive('admin', req.url);
});

var nowjs = require("now");
var everyone = nowjs.initialize(app);

everyone.now.distribute = function(message){
  // this.now exposes caller's scope
  everyone.now.receive(this.now.name, message);
};


