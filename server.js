var
	express = require('express')
,	http = require('http')
,	fs = require('fs')
,	url  = require('url')


var app = express.createServer();
app.configure(function() {

  app.use(app.router);
  app.use(express.static(__dirname+"/public"));

}).listen(0);

var	logger = require('./logger').initialize(app)
,	homepage = fs.readFileSync(__dirname+ '/public/index.html', 'utf-8');

console.log(logger);

/* ----- ROUTES -----*/

app.get('/:name/__log', function(req, res, next){
	res.send('OK');
	var name = req.params.name;

	try { logger.printData(name, url.parse(req.url, true)); }
	catch(err) { log(err, 'error'); }
});


app.get('/:name', function(req, res){
	logger.log(req.params);
	var name = req.params.name || 'unknown';

	res.send(homepage.replace('{{{{name}}}}', name));
});