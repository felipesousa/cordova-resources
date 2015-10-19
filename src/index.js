var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
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
		var deferred = Q.defer();
		var items = JSON.parse(fs.readFileSync(`${__dirname}/../platforms/${platform}/${resource}.json`));

		_.forEach(items, function(item) {
			var imagePath = `${platform}-${resource}.png`;

			//item.dest = item.dest.replace('{projectName}', projectName);
			mkdirp(path.dirname(item.dest), function() {
				fs.accessSync(imagePath, fs.R_OK);
				fs.accessSync(path.dirname(item.dest), fs.W_OK);

				deferred.resolve(convert.resize(imagePath, item.dest, item));
			});
		});

		promises.push(deferred.promise);
	});

	return Q.all(promises);
}

module.exports = _.spread(generate);