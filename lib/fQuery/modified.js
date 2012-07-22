/*jshint node: true, strict: false */

var _ = require('underscore');


module.exports = function (fQuery) {

	return {

		modified: function (arg, deps, keepAll) {

			var modified = [],
				depsModified = false;

			if (_.isString(arg)) {

				var blob = fQuery(arg).get(0);

				if (!blob) {
					modified = Array.prototype.slice.call(this);
				} else {
					var stamp = blob.timestamp.valueOf();

					this.each(function () {

						if (this.timestamp.valueOf() >= stamp) {
							modified.push(this);
						}
					});

					if (!modified.length && deps) {
						_.each(fQuery(deps), function (depBlob) {
							if (depBlob.timestamp.valueOf() >= stamp) {
								depsModified = true;
							}
						});
					}
				}
			}

			if (_.isFunction(arg)) {

				this.each(function () {

					var blob = this,
						targetBlob = fQuery(arg.call(this)).get(0);

					if (!targetBlob || blob.timestamp.valueOf() >= targetBlob.timestamp.valueOf()) {
						modified.push(blob);
					} else if (deps) {

						var stamp = targetBlob.timestamp.valueOf();

						_.each(fQuery(deps), function (depBlob) {

							if (depBlob.timestamp.valueOf() >= stamp) {
								modified.push(blob);
							}
						});
					}
				});
			}

			var list = [];

			_.each((depsModified || keepAll && modified.length) ? this : modified, function (blob) {

				list.push(blob);
			});

			return this.pushStack(list);
		}
	};
};