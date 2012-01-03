var express = require('express');
var app = express.createServer();
var http = require('http');
var fs = require('fs');
var async = require('async');
var Data = require('data');
var url  = require('url');
var _ = require('underscore');

// App Config
var config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'));
var seed = JSON.parse(fs.readFileSync(__dirname+ '/db/schema.json', 'utf-8'));

app.configure(function() {
  app.use(app.router);
  app.use(express.static(__dirname+"/public"));
}).listen(999);


app.get('/log', function(req, res){
	res.end(JSON.stringify(config));
});

var nowjs = require("now");
var everyone = nowjs.initialize(app);


everyone.now.distribute = function(message){
  everyone.now.receive(this.now.name, message);
};

function log(data, msg) {
	if(!msg) msg = '';
	everyone.now.receiveLog(msg, data);
}


