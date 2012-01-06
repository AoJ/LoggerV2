var express = require('express');
var app = express.createServer();
var http = require('http');
var fs = require('fs');
var async = require('async');
var Data = require('data');
var url  = require('url');
var nowjs = require("now");
var _ = require('underscore');

// App Config
var config = JSON.parse(fs.readFileSync(__dirname+ '/config.json', 'utf-8'));

app.configure(function() {
  app.use(app.router);
  app.use(express.static(__dirname+"/public"));
}).listen(config.server_port, config.server_host);

var groups = new Data.Hash();

app.get('x:name', function(req, res){
	var name = req.params.name;
	var group = nowjs.getGroup(name);

	//add new group if not exists
	if ( ! (groups.index(name) >= 0)) {
		groups.set(name, group);
	}

	//if(! group.has)

	//parse request
	var parsedUrl = (url.parse(req.url, true) || {}).query;

	group.now.newData(parsedUrl);

});

app.get('/:name/__log', function(req, res){
	var name = req.params.name;
	var group = nowjs.getGroup(name);

	//add new group if not exists
	if ( ! (groups.index(name) >= 0)) {
		group.now.distribute = function(data) {
			group.now.newData(data);
		}
		groups.set(name, group);
	}

	//parse request
	var parsedUrl = (url.parse(req.url, true) || {}).query;

	group.now.distribute(parsedUrl);
	res.send('OK');

});


var everyone = nowjs.initialize(app);

nowjs.on('connect', function() {
  //this.user.clientId
});


everyone.now.distribute = function(message){
  everyone.now.receive(this.now.name, message);
};

function log(data, msg) {
	if(!msg) msg = undefined;
	everyone.now.receiveLog(msg, data);
}




