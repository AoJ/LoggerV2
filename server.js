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
var schema = JSON.parse(fs.readFileSync(__dirname+ '/db/schema.json', 'utf-8'));


app.configure(function() {
  app.use(app.router);
  app.use(express.static(__dirname+"/public"));
}).listen(config.server_port, config.server_host);


app.get('/__log', function(req, res){
	var graph = new Data.Graph(schema, false);
	graph.set({
	  type: "/logger/user",
	  name: "Bart Simpson"
	});


	graph.connect('couch', { url: "http://hegenbart:aXJT5zLcGZ@81.169.133.153:5984/logger" });
	graph.merge(schema,{dirty: true});
	graph.sync(function(err) { res.write(JSON.stringify(err)); if (!err) res.write('Successfully synced'); });
	res.end(JSON.stringify(graph));
	/*try {
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
	}*/
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




