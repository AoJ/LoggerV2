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
//var schema = JSON.parse(fs.readFileSync(__dirname+ '/db/schema.json', 'utf-8'));

var schema = {
  "/type/person": {
    "type": "/type/type",
    "name": "Person",
    "properties": {
      "name": {"name": "Name", "unique": true, "type": "string", "required": true},
      "origin": {"name": "Origin", "unique": true, "type": "/type/location" }
    }
  },
  "/type/location": {
    "type": "/type/type",
    "name": "Location",
    "properties": {
      "name": { "name": "Name", "unique": true, "type": "string", "required": true },
      "citizens": {"name": "Citizens", "unique": false, "type": "/type/person"}
    }
  }
};

app.configure(function() {
  app.use(app.router);
  app.use(express.static(__dirname+"/public"));
}).listen(config.server_port, config.server_host);


app.get('/__log', function(req, res){
	var graph = new Data.Graph(schema);
	graph.set({
	  _id: "/person/bart",
	  type: "/type/person",
	  name: "Bart Simpson"
	});

	graph.set({
	  _id: "/location/springfield",
	  name: "Springfield",
	  type: "/type/location",
	  citizens: ["/person/bart"]
	});
	try {
		var parsedUrl = url.parse(req.url, true);
		var logData = {
			type: "log",
			app: "",
			message: parsedUrl.query.message,
			data: parsedUrl.query.data || {}
		};
		//everyone.now.__log(logData);
		log(logData);

	} catch(err) {
	}
});

var nowjs = require("now");
var everyone = nowjs.initialize(app);


everyone.now.distribute = function(message){
  everyone.now.receive(this.now.name, message);
};

function log(data, msg) {
	if(!msg) msg = undefined;
	everyone.now.receiveLog(msg, data);
}




