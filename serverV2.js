var
		express = require('express')
		, http = require('http')
		, fs = require('fs')
		, nowjs = require('now')
		, url = require('url')
		, nano = require('nano')
		, cli = require('cli')

		, app
		, couch
		, db
		, logger = require('./logger')
		;

global.config = fs.readFileSync(__dirname + '/config.json', 'utf-8');
cli.parse({port:['p', 'Listen on this port', 'number', 0]});

couch = nano(global.config.couchdb_url);
db = couch.use(global.config.db.logger);

app = express.createServer();
app.configure(function () {
	app.use(app.router);
	app.use(express.static(__dirname + "/public"));
});

var homepage = fs.readFileSync(__dirname + '/public/index.html', 'utf-8');
var everyone = nowjs.initialize(app);

logger.initialize(everyone);


/* ----- ROUTES -----*/

app.get('/:name/__log', function (req, res, next) {
	var name = req.params.name;
	res.send(name);

	logger.printData(name, url.parse(req.url, true));
});


app.get('/:name', function (req, res) {
	var name = req.params.name || 'unknown';

	res.send(homepage.replace('{{{{name}}}}', name));
});


cli.main(function (args, options) {
	app.listen(options.port);
	this.ok('Listening on port ' + options.port);
});
