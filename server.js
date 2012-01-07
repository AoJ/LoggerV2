var
	express = require('express')
,	http = require('http')
,	fs = require('fs')
,	nowjs = require('now')
,	url  = require('url')


var app = express.createServer();
app.configure(function() {

  app.use(app.router);
  app.use(express.static(__dirname+"/public"));


});

var	logger = require('./logger');
var homepage = fs.readFileSync(__dirname+ '/public/index.html', 'utf-8');
var everyone = nowjs.initialize(app);


/* ----- ROUTES -----*/

app.get('/:name/__log', function(req, res, next){
	res.send('OK');
	var name = req.params.name;

	everyone.now.distr({a: 'test'});

	//try {
		//logger.printData(name, url.parse(req.url, true));
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
//logger.initialize(app);

everyone.now.distr = function(a) {
	everyone.now.newData(a);
};