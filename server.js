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
var everyone = nowjs.initialize(app);

app.configure(function() {
  app.use(app.router);
  app.use(express.static(__dirname+"/public"));
}).listen(config.server_port, config.server_host);

function serveStartpage(req, res) {

}
var groups = new Data.Hash();


app.get('/:name/__log', function(req, res, next){
	res.send('OK');
	//var name = req.params.name;
	//var group = nowjs.getGroup(name);

	//add new group if not exists
	//if ( ! (groups.index(name) >= 0)) {
	//	group.now.distribute = function(data) {
	//		group.now.newData(data);
	//	}
		//groups.set(name, group);
	//}

	//parse request
	var parsedUrl = (url.parse(req.url, true) || {}).query;

	//group.now.distribute(parsedUrl);
	everyone.now.distribute(parsedUrl);
	//log(parsedUrl);

});

app.get('/:name', function(req, res){
	var name = req.params.name;

	html = fs.readFileSync(__dirname+ '/public/index.html', 'utf-8');
	res.send(html.replace('{{{{name}}}}', name));

});



nowjs.on('connect', function() {
	var name = this.now.name || 'unknown';
	//var group = nowjs.getGroup(name);

	//if(! group.hasClient(this.user.clientId)) {
	//	group.addUser(this.user.clientId);
	//}
	//log(group);
});

everyone.now.distribute = function(data) {
	everyone.now.newData(data);
}

function log(data, msg) {
	if(!msg) msg = undefined;
	everyone.now.receiveLog(msg, data);
}




