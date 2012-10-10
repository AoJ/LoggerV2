var
		express = require('express')
		, http = require('http')
		, fs = require('fs')
		, util = require('util')
		, nowjs = require('now')
		, url = require('url')
		, nano = require('nano')
		, cli = require('cli')
		, moment = require('moment')

		, app
		, couch
		, db
		, logger = require('./logger')
		;

global.config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8'));
cli.parse({port:['p', 'Listen on this port', 'number', 0]});

zapakatel = nano(global.config.zapakatel_url);
n13 = nano(global.config.n13_url);
zapakatel_db = zapakatel.use(global.config.db.zapakatel);
n13_db = n13.use(global.config.db.n13);

app = express.createServer();
app.configure(function () {
	app.use(app.router);
	app.use(express.static(__dirname + "/public"));
});

n13.relax({db: "zapa/_all_docs/?limit=10", limit: 100}, function(data){
console.log(arguments);
});
