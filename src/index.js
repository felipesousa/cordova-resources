var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var convert = require('./convert');

var resources = ['icon', 'splash'];
var platforms = fs.readdirSync('./platforms');

function generate (pwd, platform) {
	var promises = [];

	if(!platform) {
		return Q.all(_.map(platforms, function(name) {
			return generate(pwd, name);
		}));
	}

	_.forEach(resources, function(resource) {
		var items = JSON.parse(fs.readFileSync(`../platforms/${platform}/${resource}.json`));

		_.forEach(items, function(item) {
			promises.push(convert.resize(`${platform}-${resource}.png`));
		});
	});

	return Q.all(promises);
}

module.exports = _.spread(generate);