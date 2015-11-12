/*!
 * Simple JavaScript template engine
 * https://github.com/JoniJnm/jstemplate
 *
 * Copyright JoniJnm.es
 * Released under the GPL-2.0 license.
 *
 * Date: @DATE
 */

/*jslint evil: true */

(function (root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    }
	else if (typeof module !== 'undefined' && module.exports) {
        // CommonJS/Node module
        module.exports = factory();
    }
	else {
        // Browser globals
        root.jstemplate = factory();
    }
}(this, function () {
	'use strict';

	var Evaler = function(html) {
		this.html = html;
		this.code = '';
		this.startBlocks = ['if', 'for', 'while', 'foreach'];
		this.continueBlocks = ['else', 'else if', 'elseif'];
		this.eachRegex = /^foreach ([\w\._]+) as ([\w_]+)$/;
	};

	Evaler.prototype = {
		add: function(code) {
			this.code += code;
			this.code += '\n';
		},
		initCode: function() {
			this.add('with(data) {');
			this.add('var html = "";');
		},
		endCode: function() {
			this.add('}');
			this.add('return html;');
		},
		addRawHTML: function(html) {
			this.add('html += '+JSON.stringify(html)+';');
		},
		addRawCode: function(code) {
			this.add(code+';');
		},
		addReturnedCode: function(code) {
			this.add('html += '+code.substr(1)+';');
		},
		addEachBlock: function(code) {
			var match = code.match(this.eachRegex);
			var arr = match[1];
			var item = match[2];
			this.add('var _i = -1;');
			this.add('for (var _key in '+arr+') {');
			this.add('if (!'+arr+'.hasOwnProperty(_key)) continue;');
			this.add('_i++;');
			this.add('var '+item+' = '+arr+'[_key];');
		},
		addStartBlock: function(code) {
			code = code.replace(/ /, ' ('); //the first space
			code += ') {';
			this.add(code);
		},
		addContinueBlock: function(code) {
			this.addEndBlock();
			if (code === 'else') {
				this.add('else {');
			}
			else {
				code = code.replace(/^else if/, 'elseif');
				code = code.replace(/ /, ' ('); //the first space
				code = code.replace(/^elseif/, 'else if');
				code += ') {';
				this.add(code);
			}
		},
		addEndBlock: function() {
			this.add('}');
		},
		run: function() {
			this.initCode();
			var posStart = 0;
			var html = this.html;
			var that = this;
			html.replace(/{(.*?)\}/g, function(match, code, pos) {
				code = code.replace(/^[ ]+/, '').replace(/ +$/, ''); //trim spaces
				that.addRawHTML(html.substr(posStart, pos-posStart));
				if (that.isEachBlock(code)) {
					that.addEachBlock(code);
				}
				else if (that.isStartBlock(code)) {
					that.addStartBlock(code);
				}
				else if (that.isContinueBlock(code)) {
					that.addContinueBlock(code);
				}
				else if (that.isEndBlock(code)) {
					that.addEndBlock(code);
				}
				else if (that.isReturnedCode(code)) {
					that.addReturnedCode(code);
				}
				else if (!that.isComment(code)) {
					that.addRawCode(code);
				}
				posStart = pos + match.length;
			});
			this.endCode();
		},
		isEachBlock: function(code) {
			return this.eachRegex.test(code);
		},
		isStartBlock: function(code) {
			var reg = new RegExp('^('+this.startBlocks.join('|')+')');
			return reg.test(code);
		},
		isContinueBlock: function(code) {
			var reg = new RegExp('^('+this.continueBlocks.join('|')+')');
			return reg.test(code);
		},
		isEndBlock: function(code) {
			return code[0] === '/';
		},
		isReturnedCode: function(code) {
			return code[0] === '=';
		},
		isComment: function(code) {
			return code[0] === '*';
		},
		getCode: function() {
			return this.code;
		}
	};

	var jstemplate = function(html) {
		var evaler = new Evaler(html);
		evaler.run();
		var code = evaler.getCode();
		var func;
		try {
			func = new Function('data', code);
		}
		catch(e) {
			e.code = code;
			throw e;
		}
		return function(data) {
			try {
				return func.call(null, data);
			}
			catch(e) {
				e.code = code;
				throw e;
			}
		};
	};

	return jstemplate;
}));
