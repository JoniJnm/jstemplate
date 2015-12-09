/*!
* requirejs plugin to load templates
* https://github.com/JoniJnm/jstemplate
*
* Copyright JoniJnm.es
* Released under the GPL-2.0 license.
*/

(function () {
	'use strict';

	var jstemplatePath = './jstemplate'; //change if needed
	var textPath = './text'; //change if needed http://requirejs.org/docs/download.html#text

	define([jstemplatePath], function (jstemplate) {
		return {
			load: function (name, req, onLoad, config) {
				config = config || {};
				req([textPath+'!'+name+'.tpl'], function(tpl) {
					if (config.isBuild) {
						onLoad();
					}
					else {
						onLoad(jstemplate.parse(tpl));
					}
				});
			}
		};
	});
}());
