var
		express = require('express')
		, http = require('http')
		, nano = require('nano')
		, cli = require('cli')
		, fs = require('fs')
		, moment = require('moment')
		, xml2js = require('xml2js')
		, request = require('request')
		, _ = require('underscore')

		, app
		;

app = express.createServer();
app.configure(function () {
	app.use(app.router);
	app.use(express.static(__dirname + "/public/feed-watchman"));
});

cli.parse({port:['p', 'Listen on this port', 'number', 0]});

var couch = nano('http://c.n13.cz:9090');
var db = couch.use('feed-watchman');
var db_old = couch.use('feed-watchman-bak');

var parser = new xml2js.Parser();
var url = 'http://www.vykupto.cz/xml-export/jmeno_serveru/';
/*request(url, function (e, feed) {

	parser.parseString(feed.body, function (err, result) {
		result.meta = {
			time:moment().format("YYYY-MM-DD HH:mm:ss"),
			url:url,
			size:feed.client.bytesRead,
			headers:feed.headers
		};
		result.DEAL = result.DEAL;
		db.insert(result, function (e, doc) {
			console.log('inserted');
		});
	});
});*/

var orm = {
	save:function (data, key, cb) {
		if (!cb) {
			cb = key;
			key = undefined;
		}
		if (!key && data._id) key = data._id;

		if (key) {
			data._id = key;
			db.get(key, function (e, doc) {

				if (doc._rev) {
					data._rev = doc._rev;
				}
				db.insert(data, function (e, doc) {
					return cb(e, doc);
				});
			});
		} else {
			db.insert(data, function (e, doc) {
				return cb(e, doc);
			});
		}
	}
};


app.get('/grabFeed', function (req, res) {
	var url = req.query.feedurl;
	var name = req.query.name;

	if( ! url || ! name) {
		return res.send('NO URL OR NAME');
	}

	//timeout handler
	setTimeout(function() {
		if(! send ) res.send('TIMEOUT');
	}, 10000);

	var send = false;
	request(url, function (e, feed) {
		parser.parseString(feed.body, function (err, result) {
			if ( ! result) return res.send('PARSE ERROR ' + err);

			result.meta = {
				time:moment().format("YYYY-MM-DD HH:mm:ss"),
				url:url,
				name: name,
				size:feed.client.bytesRead,
				headers:feed.headers
			};

			//move deal data to end of object
			var tmp  = result.DEAL;
			delete result.DEAL;
			result._id = name + '-' + moment().format("YYYY-MM-DD-HH");
			result.DEAL = tmp;

			orm.save(result, function (e, doc) {
console.log(doc);
				if( ! send) res.send('OK');
				send = true;
			});
		});
	});
});

var homepage = fs.readFileSync(__dirname + '/public/feed-watchman/index.html', 'utf-8');
var portalpage = fs.readFileSync(__dirname + '/public/feed-watchman/portal.html', 'utf-8');
app.get('/data', function (req, res) {

	couch.request({db:"feed-watchman/_design/feed/_view/counts?group=true&group_level=1"}, function(e, data){
		res.send(data);
	});

});

app.get('/portal/:portal', function (req, res) {
	var portal = req.params.portal;
	res.send(portalpage.replace('{{portal}}', req.params.portal));

});

app.get('/data/:portal', function (req, res) {
	var portal = req.params.portal;
	db.view("feed", "counts", {"include_docs":"false", group: true, group_level: 5, startkey: [portal], endkey: [portal, {}]}, function(e, data){
		res.send(data);
	});

});


app.get('/list', function(req, res) {
	db.changes(function(e, data){
		res.send('<html><body><ul>' + _.map(data.results, function(row){
			return '<li><a href="/download/'+row.id+'">' + row.id + '</a></li>';
		}).join('')+'</ul></body></html>');
	});

});

app.get('/download/:doc', function(req, res) {
	db.get(req.params.doc, function(e, doc){
		if ( ! doc._rev || e) return res.send('Feed "' + req.params.doc + '" nebyl nalezen');

		res.send(doc);

	})

});

app.get('/detail/:doc', function(req, res) {
	db.get(req.params.doc, function(e, doc){
		if ( ! doc._rev) return res.send('Feed "' + req.params.doc + '" nebyl nalezen');

		var start = [];

		var first = false;
		var table = '<html><body><table>' + _.map(doc.DEAL, function(deal){
			var prefix = '';
			if ( ! first) {
				prefix = "<tr><th>" + _.map(deal, function(value, key){
								return key;
							}).join('</td><th>') + "</th></tr>";
				first = true;
			}
			return prefix + "<tr><td>" + _.map(deal, function(value, key){
				if (typeof value == 'object') value = JSON.stringify(value);
				return value;
			}).join('</td><td>') + "</td></tr>";
		}).join('') + '</table></body></html>';

		res.send(table);

	})

});



//http://watchman.zapakatel.cz:4056/test/1581/1650
/*app.get('/test/:from/:to', function(req, res) {
	var from = parseInt(req.params.from);
	var to = parseInt(req.params.to);
	db_old.changes(function(e, data){
		res.write("\n" + data.results.length + "\n\n");
		res.write("\n" + from + ':' +to + "\n\n");
		var ids = _.map(data.results.slice(from, to), function(row){
			console.log(row.id);
			db_old.get(row.id, function(e, data){
				if( ! data.meta) return;
				delete data._rev;

				var time = (data.meta.time + '').split(':')[0].replace(' ', '-');
				data._id = data.meta.name + '-' + time;

				 console.log(data._id);
				orm.save(data, data._id, function(r, d) {
					res.write("\n" + row.id + ' - ' + data._id + ' >> ' + d.rev);
					console.log(d.rev);
					delete data;
					delete r;
				});
			});
		});

		//res.end();
	});
});*/


cli.main(function (args, options) {
	app.listen(options.port);
	this.ok('Listening on port ' + options.port);
});
