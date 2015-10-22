var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var convert = require('./convert');
var parseString = require('xml2js').parseString;
require('simple-colors');

var settings = {CONFIG_FILE: 'config.xml'}
var resources = ['icon', 'splash'];

var hasConfigFile = function () {
	var deferred = Q.defer();
	fs.access(settings.CONFIG_FILE, fs.R_OK, function (err){
		if(err){
			console.log();
			console.log("Your project hasn't file CONFIG.XML :(".red());
			console.log();
			return deferred.reject(err);
		} else {
			console.log();
			console.log("Your project has file config.xml! :)".green());
			console.log();
			return deferred.resolve();
		}
	});

	return deferred.promise;
};

var getProjectName = function () {
	var deferred = Q.defer();

	fs.readFile(settings.CONFIG_FILE, function(err, data) {
		if(err){

			console.log('----------------------------------');
			console.log("Your CONFIG.XML file don't exists!".red());
			console.log('----------------------------------');

		 	return deferred.reject(err);
		}

	  parseString(data, function(err, result) {
			if(err){
				console.log('---------------------');
				console.log("Error read CONFIG.XML ".red());
				console.log('---------------------');
				return deferred.reject(err);
			}

		projectName = result.widget.name[0];
			console.log('------------------------------------------');
			console.log("The name your project is ".green() + projectName .green()+ "!".green());
			console.log('------------------------------------------');

			deferred.resolve(projectName);
		});
	});

	return deferred.promise;
};

function generate (pwd, platform) {
	var promises = [];
	var platforms = fs.readdirSync('platforms');
	if(!platform) {
		return Q.all(_.map(platforms, function(name) {
			return generate(pwd, name);
		}));
	}

	return getProjectName()
		.then(function (projectName) {
			_.forEach(resources, function(resource) {
				var deferred = Q.defer();
				var items = JSON.parse(fs.readFileSync(`${__dirname}/../platforms/${platform}/${resource}.json`));

				_.forEach(items, function(item) {
					var imagePath = `${platform}-${resource}.png`;

					item.dest = item.dest.replace('{projectName}', projectName);

					mkdirp(path.dirname(item.dest), function() {
						fs.accessSync(imagePath, fs.R_OK);
						fs.accessSync(path.dirname(item.dest), fs.W_OK);
						console.log('-----------------------'.green());
						console.log("Generate your resources...".green() + imagePath .red() );

						deferred.resolve(convert.resize(imagePath, item.dest, item));
						console.log();
						console.log("DONE! :)".green());

					});
				});

				promises.push(deferred.promise);
			});

			return Q.all(promises);  
		});

}

module.exports = _.spread(generate);
