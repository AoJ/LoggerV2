var
	_ = require('underscore')
,	url  = require('url')
,	nowjs = require('now')
,	Data = require('data')
;

var logger = function() {
	this.uid = Math.floor(Math.random() * 10000);
};

logger.prototype = {

	/**
	 * constructor
	 * @param nowjs
	 * @param everyone
	 */
	initialize: function(everyone) {
		this.everyone = everyone;
		this.groups = new Data.Hash();

		//@TODO refactor
		var that = this;
		nowjs.on('connect', function() {
			var name = this.now.name || 'everyone'
			,	group = that.getGroup(name)
			,	clientId = this.user.clientId;

			that.trace('new connection', [{name: name, group: group, clientId: clientId}]);

			that.addUserToGroup(group, clientId);
		});
		return this;
	},

	/**
	 * send some data to group
	 * @param name
	 * @param params
	 */
	printData: function(name, params) {
		var data = params || {};

		var now = new Date();
		data.time = '' + now.toUTCString();// format('yyyy-mm-dd HH:MM:ss');
		this.getGroup(name).now.distribute(data);
	},

	/**
	 * send some data to group
	 * @param name
	 * @param params
	 */
	couchLog: function(name, data) {
		this.getGroup(name).now.distributeLog(data);
	},

	/**
	 * return and initialize group
	 * @param name
	 * @return group
	 */
	getGroup: function(name) {

		//return exists group
		var foundGroupIndex = this.groups.index(name);
		if(foundGroupIndex >= 0) {
			return this.groups.at(foundGroupIndex);
		}

		//group don't exists yet,
		//then create new
		var group = this.initGroup(name);
		this.groups.set(name, group);

		return group;
	},

	/**
	 * initialize new group
	 * @param name
	 * @return group
	 */
	initGroup: function(name) {
		var group = nowjs.getGroup(name);

		//bootstrap new group
		this.trace('new group', [name, group]);
		group.now.distribute = function(data) {
			this.now.newData(data);
		}
		group.now.distributeLog = function(data) {
			this.now.log(data);
		}
		return group;
	},

	/**
	 * add user to group
	 * @param group
	 * @param clientId
	 * @return group
	 */
	addUserToGroup: function(group, clientId) {
		//if (! group.hasClient(clientId)) {
			this.trace('new user in group', group, clientId);
			group.addUser(clientId);
		//}
		return group;
	},

	/**
	 * logging to browser console
	 * @TODO log only admin user
	 * @param data
	 * @param msg
	 */
	log: function(data, msg) {
		if(!msg) msg = undefined;
		this.everyone.now.receiveLog(msg, data);
	},

	/**
	 * only for debug think
	 * simple tracer
	 */
	trace: function() {}

}
module.exports = new logger;