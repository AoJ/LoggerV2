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
		, crypto = require('crypto')
		, request = require('request')

		, app
		, couch
		, db
		, logger = require('./logger')
		;

global.config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8'));
cli.parse({port:['p', 'Listen on this port', 'number', 0]});

couch = nano(global.config.couchdb_url);
db = couch.use(global.config.db.logger);
//console.log(db);
app = express.createServer();
app.configure(function () {
	app.use(express.cookieParser());
	app.use(app.router);
	app.use(express.static(__dirname + "/public"));
});

var homepage = fs.readFileSync(__dirname + '/public/index.html', 'utf-8');
var homepage_graph = fs.readFileSync(__dirname + '/public/index_graph.html', 'utf-8');
var everyone = nowjs.initialize(app);

logger.initialize(everyone);

var img = fs.readFileSync(__dirname + '/public/images/cc3300.gif');
var Stream = require('stream').Stream;

function BufferStream () {
    Stream.apply(this);
    this.finished = false;
    this.writable = true;
}
util.inherits(BufferStream, Stream);

BufferStream.prototype.write = function write(raw) {
	//console.log(raw.toString());
	//logger.couchLog('z', JSON.parse(raw.toString()));
    this.emit('update');
    return true;
};

BufferStream.prototype.end = function(str) {
	if(str) logger.couchLog('aoj', JSON.parse(raw.toString()));
};

//var test = new BufferStream();
//db.get("_changes", {since:52,feed:"continuous",style:"all_docs"}).pipe(test);

/* ----- ROUTES -----*/

app.get('/:name/__log', function (req, res, next) {
	//if(!req.cookies.uid) {
	//	res.cookie('uid', hash, { expires: new Date(Date.now() + 90000000000000), httpOnly: true });
	//}

		res.header('Content-Type', 'image/gif');
		res.header('X-Powered-By', 'allin1');
		res.send(img, 200);
	var name = req.params.name;


	var data = {
		"type": ['/type/access'],
		"time": (new Date).toISOString(),
		"duration": req.query.duration,
		"group": name,
		"project": req.query.project,
		"ip": req.connection.remoteAddress,
		"message": req.query.message,
		"data": req.query.data,
		"criteria": req.query.criteria,
		"ext": req.query.ext || {}
	};

	data.private = { headers: {
		referrer: req.header('referrer'),
		"user-agent": req.header('user-agent')
	} };

	//res.send(req.headers);;

if(data.project === 'zapakatel-next') {
		//request.post({url:'d.n13.cz:4056/log/visit'}, function (e, r, body) {
		request.post({ url: 'http://d.n13.cz:4056/log/visit',
               form: data}, function (er, req, body) {
  //if (er) throw er;
	})
	}

//	db.insert(data, function(e, doc){




		/*db.get(doc.id, {rev: doc.rev}, function(e, doc){
			//res.send(doc);
		})*/
//	})

	logger.printData(name, data);
});

app.get('/:name/__log2', function (req, res, next) {
	res.contentType(__dirname + '/public/images/zapa.gif');
	res.send(favico, 200);
	var name = req.params.name;


	var data = {
		"type": ['/type/access'],
		"time": moment.now,
		"duration": req.query.duration,
		"group": name,
		"project": req.query.project,
		"ip": req.query.ip,
		"message": req.query.message,
		"criteria": req.query.criteria || [],
		"data": req.query.data,
		"ext": req.query.ext || {}
	};

	db.insert(data, function(e, doc){




		/*db.get(doc.id, {rev: doc.rev}, function(e, doc){
			//res.send(doc);
		})*/
	})

	logger.printData(name, data);
});


app.get('/logDemo', function (req, res) {
	var name = 'a';

	res.send(homepage_graph.replace('{{{{name}}}}', name));
});


app.get('/:name', function (req, res) {
	var name = req.params.name || 'unknown';

	res.send(homepage.replace('{{{{name}}}}', name));
});


cli.main(function (args, options) {
	app.listen(options.port);
	this.ok('Listening on port ' + options.port);
});
