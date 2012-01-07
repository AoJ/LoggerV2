var
	express = require('express')
,	http = require('http')
,	fs = require('fs')
,	url  = require('url')


var app = express.createServer();
app.configure(function() {

  app.use(app.router);
  app.use(express.static(__dirname+"/public"));


});

var	logger = require('./logger.js').initialize(app)
,	homepage = fs.readFileSync(__dirname+ '/public/index.html', 'utf-8');


/* ----- ROUTES -----*/

app.get('/:name/__log', function(req, res, next){
	res.send('OK');
	console.log(logger);
	var name = req.params.name;

	//try {
		logger.printData(name, url.parse(req.url, true));
	//}
	//catch(err) { console.log(err, 'error'); }
});


app.get('/:name', function(req, res){
	setTimeout(function() {
		//console.log(logger);
	}, 1000);
	//logger.log(req.params);
	var name = req.params.name || 'unknown';

	res.send(homepage.replace('{{{{name}}}}', name));
});

app.listen(0);
