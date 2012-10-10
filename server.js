var
	express = require('express')
,	http = require('http')
,	fs = require('fs')
,	nowjs = require('now')
,	url  = require('url')
;

var app = express.createServer();
app.configure(function() {

  app.use(app.router);
  app.use(express.static(__dirname+"/public"));


});

var	logger = require('./logger');
var homepage = fs.readFileSync(__dirname+ '/public/index.html', 'utf-8');
var everyone = nowjs.initialize(app);

logger.initialize(everyone);


/* ----- ROUTES -----*/

app.get('/:name/__log', function(req, res, next){
	var name = req.params.name;
	res.send(name);

	logger.printData(name, url.parse(req.url, true));
});


app.get('/:name', function(req, res){
	var name = req.params.name || 'unknown';

	res.send(homepage.replace('{{{{name}}}}', name));
});

app.listen(0);
