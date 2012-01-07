var
	_ = require('underscore')
,	url  = require('url')
,	nowjs = require('now')
,	Data = require('data')
;

var logger = function() {
	this.uid = Math.floor(Math.random * 1e5);
};

logger.prototype = {

	/**
	 * constructor
	 * @param nowjs
	 * @param everyone
	 */
	initialize: function(app) {
		this.everyone = nowjs.initialize(app);

		//@TODO refactor
		var that = this;
		nowjs.on('connect', function() {
			var name = that.now.name || 'unknown'
			,	group = that.getGroup(name)
			,	clientId = this.user.clientId;

			that.trace('new connection', [{name: name, group: group, clientId: clientId}]);

			that.addUserToGroup(group, clientId);
		});
	},

	/**
	 * send some data to group
	 * @param name
	 * @param params
	 */
	printData: function(name, params) {
		var data = params.query || {};

		this.getGroup(name).distribute(data);
	},

	/**
	 * return and initialize group
	 * @param name
	 * @return group
	 */
	getGroup: function(name) {
		var group = nowjs.getGroup(name);

		//bootstrap new group
		if (!_.isFunction(group.now.distribute)) {
			trace('new group', [name, group]);
			group.now.distribute = function(data) {
				group.now.newData(data);
			}
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
		if (! group.hasClient(clientId)) {
			trace('new user in group', group, clientId);
			group.addUser(clientId);
		}
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