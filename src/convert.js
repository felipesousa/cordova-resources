var Q		= require('q');
var gm 	= require('gm');

/**
 * convert.resize('./android-screen.png', 'platforms/android/res/(...)/screen.png', {
 *   width: 1000,
 *   height: 200
 * });
 */
exports.resize = function(path, dest, dimensions) {
	var image = gm(path).resize(dimensions.width, dimensions.height);
	var deferred = Q.defer();

	image.write(dest, function(err, data) {
		if(err) {
			deferred.reject(err);
		} else {
			deferred.resolve(data);
		}
	});

	return deferred.promise;
};