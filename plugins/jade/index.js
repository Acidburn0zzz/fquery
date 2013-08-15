/*jshint node: true */
'use strict';


module.exports = function (fQuery) {


	var _ = require('underscore'),

		reJadeError = /(\w+):\s+(.*?):(\d*).*\n(?:\s.*\n*)*(.*)/,

		parseJadeError = function (err) {

			var match = err.toString().match(reJadeError);
			if (!match) {
				return {};
			}
			return { type: match[1], file: match[2], line: parseInt(match[3], 10), message: match[4] };
		};


	return {

		jade: function (locals, options) {

			var jade = require('jade');

			return this.edit(function (blob, idx, fquery) {

				var settings = _.extend({}, options, {filename: blob.source});

				try {
					var render = jade.compile(blob.content, settings);
					blob.content = render(locals);
				} catch (err) {

					var parsed = parseJadeError(err);

					fQuery.error({
						method: 'jade',
						message: parsed.message + ' (' + parsed.type + ')',
						fquery: fquery,
						blob: blob,
						file: parsed.file,
						line: parsed.line,
						data: err
					});
				}
			});
		}
	};
};