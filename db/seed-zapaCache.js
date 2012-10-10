var fs = require('fs');
var assert = require('assert');
var Data = require('data');
var crypto = require('crypto');
var _ = require('underscore');

var couchdb_url = "http://c.n13.cz:9090/zapa";
var seed = JSON.parse(fs.readFileSync(__dirname+ '/zapa_cache.json', 'utf-8'));

var graph = new Data.Graph(seed, {dirty: true}).connect('couch', { url: couchdb_url });

graph.set({
	_id: 'deal-540343-cs',
	type: '/type/deal',
	deal_id: '540343',
	lang: 'cs',
	deal_title: "ABC a ROKOKO od 110 Kč, Batulková, Čech, Potměšil, Hádek a další!"
});

graph.set({
	_id: 'deal-540343-sk',
	type: '/type/deal',
	deal_id: '540343',
	lang: 'sk',
	deal_tile: "ABC a ROKOKO od 110 Kč, Batulková, Čech, Potměšil, Hádek a další!"
});

if (process.argv[2] == "--flush") {
  graph.adapter.flush(function(err) {
    console.log('DB Flushed.');
    err ? console.log(err)
        : graph.sync(function(err) {
          console.log('invalidNodes:');
          console.log(graph.invalidNodes().keys());
          
          err ? console.log(err)
              : console.log('Couch seeded successfully.\nStart the server: $ node server.js');
        });
  });
} else {
  graph.sync(function(err) {
    console.log('invalidNodes:');
    console.log(graph.invalidNodes().keys());
    
    console.log('conflictedNodes:');
    console.log(graph.conflictedNodes().keys());
    
    err ? console.log(err)
        : console.log('Couch seeded successfully.\nStart the server: $ node server.js');
  });
}
