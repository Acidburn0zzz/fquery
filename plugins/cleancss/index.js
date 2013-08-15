/*jshint node: true */
'use strict';


module.exports = function (fQuery) {


	var _ = require('underscore'),

		reHeaderComment = /^\s*(\/\*((.|\n|\r)*?)\*\/)/,
		getHeaderComment = function (arg, content) {

			if (arg === '!') {
				arg = /^!/;
			}
			if (_.isString(arg)) {
				return arg;
			}
			if (!_.isRegExp(arg)) {
				return '';
			}

			var match = content.match(reHeaderComment);
			var header = match ? match[1] + '\n' : '';

			if (match && _.isRegExp(arg) && !match[2].match(arg)) {
				header = '';
			}
			return header;
		},

		defaults = {
			header: '!',
			keepSpecialComments: 0
		};


	return {

		cleancss: function (options) {

			var fquery = this,
				settings = _.extend({}, defaults, options),
				cleancss = require('clean-css');

			return this.edit(function (blob) {

				try {

					var header = getHeaderComment(settings.header, blob.content);

					blob.content = header + cleancss.process(blob.content, settings);

				} catch (err) {
					fQuery.error({
						method: 'cleancss',
						message: 'failed',
						fquery: fquery,
						blob: blob,
						data: err
					});
				}
			});
		}
	};
};