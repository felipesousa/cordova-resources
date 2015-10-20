var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var convert = require('./convert');
var xml2js  = require('xml2js');

var resources = ['icon', 'splash'];
var platforms = fs.readdirSync('./platforms');

function generate (pwd, platform) {
	var promises = [];

	if(!platform) {
		return Q.all(_.map(platforms, function(name) {
			return generate(pwd, name);
		}));
	}


	var settings = {CONFIG_FILE: 'config.xml'}

	var hasConfigFile = function () {

		var deferred = Q.defer();

		fs.access(settings.CONFIG_FILE, fs.R_OK, function (err){
			if(err){
				return deferred.reject(err);
			} else {
				return deferred.resolve();
			}
		});

		return deferred.promisse;
	};

	/*
	* Get projectName
	*/

	var getProjectName = function () {
		var deferred = Q.defer();
		var parse =	new xlm2js();

		fs.readFile(settings.CONFIG_FILE, function(err, data) {
			if(err){
			 return deferred.reject(err);
			}

		  parser.parseString(data, function(err, result) {
				if(err){
					return deferred.reject(err);
				}

			var projectName = result.widget.name[0];
				deferred.resolve(projectName);
			});
		});

		return deferred.promisse;
	};



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
