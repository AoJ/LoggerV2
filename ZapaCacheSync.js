var
		express = require('express')
		, http = require('http')
		, fs = require('fs')
		, url = require('url')
		, nano = require('nano')
		, cli = require('cli')
		, moment = require('moment')
		, _ = require('underscore')

		, app
		, couch
		;

var request = require('request');
var async = require('async-mini');

cli.parse({port:['p', 'Listen on this port', 'number', 0]});
app = express.createServer();
app.configure(function () {
	app.use(app.router);
});

var config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf-8'));


var dbs = {
	zapa: {connection: nano(config.db.zapa.url)},
	n13: {connection: nano(config.db.n13.url)}
};
dbs.zapa.db = dbs.zapa.connection.use(config.db.zapa.db);
dbs.n13.db = dbs.zapa.connection.use(config.db.n13.db);


orm = {
	save:function (data, key, cb) {
		if (!cb) {
			cb = key;
			key = undefined;
		}
		if (!key && data._id) key = data._id;

		if (key) {
			data._id = key;
			dbs.zapa.db.get(key, function (e, doc) {

				if (doc._rev) {
					data._rev = doc._rev;
				}
				dbs.zapa.db.insert(data, function (e, doc) {
					return cb(e, doc);
				});
			});
		} else {
			dbs.zapa.db.insert(data, function (e, doc) {
				return cb(e, doc);
			});
		}
	}
};


var logii = function (type, message, ext, data) {
	request('http://watchman.zapakatel.cz:4052/' + type + '/__log/?project=zapakatel&message=' + encodeURIComponent(message) + '&data=' + encodeURIComponent(JSON.stringify(data)) + '&duration=0&criteria=' + encodeURIComponent(ext));
};

var syncDocs = function(limit, offset) {
	if(!limit) throw 'limit and offset must be passed';
	dbs.n13.connection.request({db:"zapa/_all_docs?include_docs=true&limit="+limit+"&offset="+offset, include_docs:true}, function (k, docs) {
			//console.log(docs.rows[1].value);
			logii('saved', docs.rows.length, 'start, rows ' + offset);
			logii('loaded', docs.rows.length, 'start, rows ' + offset);
			var stack = [];
			async.series(_.map(docs.rows, function (doc) {
				logii('loaded', doc.id, 'loaded');
				return function (cb) {
					delete doc.doc._rev;
					orm.save(doc.doc, doc.id, function (e, doc) {
						logii('saved', doc.id, 'saved', [doc, e]);
						cb(null);
					})
				};
			}), function () {
				logii('loaded', 'end ' + (offset + batch));
				logii('saved', 'end ' + (offset + batch));
			});
		});
}

app.get('/allDeals', function (req, res) {
	res.send('OK');
	dbs.n13.connection.request({db:"zapa/_all_docs?include_docs=true&limit=0"}, function(e, result) {
		var total = result.total_rows || 0;
		var batch = 500;
		_.times(parseInt(total / batch) + 1, function(n) {
			syncDocs(batch, n * batch);
		})
	});
});


cli.main(function (args, options) {
	app.listen(options.port);
	this.ok('Listening on port ' + options.port);
});
