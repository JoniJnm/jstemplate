/*!
 * Simple JavaScript template engine
 * https://github.com/JoniJnm/jstemplate
 *
 * Copyright JoniJnm.es
 * Released under the GPL-2.0 license.
 *
 * Date: @DATE
 */

/*jslint evil: true, noempty: false */

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
		this.reservedWords = ['break', 'continue', 'debugger', 'var', 'let'];

		this.startBlockRegex = new RegExp('^('+this.startBlocks.join('|')+') ');
		this.continueBlockRegex = new RegExp('^('+this.continueBlocks.join('|')+')( |$)');
		this.rawCodeRegexs = [
			new RegExp('^('+this.reservedWords.join('|')+')( |$)'),
			/^[\w\.$]+\s*=[^=]/, //asign value to var
			/^[\w\.$]+\s*(\+\+|\-\-)$/ //increase value
		];

		this.eachRegex = /^foreach ([\w\._]+) as ([\w_]+)$/;
	};

	Evaler.prototype = {
		add: function(code) {
			this.code += code;
			this.code += '\n';
		},
		initCode: function() {
			this.add('with(__data) {');
			this.add('var html = "";');
		},
		getCode: function() {
			return this.code;
		},
		endCode: function() {
			this.add('}');
			this.add('return html;');
		},
		addRawHTML: function(html) {
			html = this.trim(html);
			if (html) {
				this.add('html += '+JSON.stringify(html)+';');
			}
		},
		addForcedRawCode: function(code) {
			this.addRawCode(code.substr(1));
		},
		addRawCode: function(code) {
			this.add(code+';');
		},
		addForcedReturnedCode: function(code) {
			this.addReturnedCode(code.substr(1));
		},
		addReturnedCode: function(code) {
			this.add('html += '+code+';');
		},
		addEachBlock: function(code) {
			var match = code.match(this.eachRegex);
			var arr = match[1];
			var item = match[2];
			this.add('var __arr = this.'+arr+';');
			this.add('var _i = -1;');
			this.add('for (var _key in __arr) {');
			this.add('if (!__arr.hasOwnProperty(_key)) continue;');
			this.add('_i++;');
			this.add('var '+item+' = __arr[_key];');
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
			html = html.replace(/<script[^>]*>([\s\S]+?)<\/script>/g, function(match, code) {
				that.add(code); //add script code
				return ''; //remove script from html
			});
			html.replace(/\{([\s\S]+?)\}/g, function(match, code, pos) {
				code = code.replace(/^[ ]+/, '').replace(/ +$/, ''); //trim spaces
				that.addRawHTML(html.substr(posStart, pos-posStart));
				if (that.isComment(code)) {
					//noting
				}
				else if (that.isEachBlock(code)) {
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
				else if (that.isForcedRawCode(code)) {
					that.addForcedRawCode(code);
				}
				else if (that.isForcedReturnCode(code)) {
					that.addForcedReturnedCode(code);
				}
				else if (that.isRawCode(code)) {
					that.addRawCode(code);
				}
				else {
					that.addReturnedCode(code);
				}
				posStart = pos + match.length;
			});
			this.endCode();
		},
		isEachBlock: function(code) {
			return this.eachRegex.test(code);
		},
		isStartBlock: function(code) {
			return this.startBlockRegex.test(code);
		},
		isContinueBlock: function(code) {
			return this.continueBlockRegex.test(code);
		},
		isEndBlock: function(code) {
			return code[0] === '/';
		},
		isForcedRawCode: function(code) {
			return code[0] === '#';
		},
		isRawCode: function(code) {
			for (var i=0; i<this.rawCodeRegexs.length; i++) {
				if (this.rawCodeRegexs[i].test(code)) {
					return true;
				}
			}
			return false;
		},
		isForcedReturnCode: function(code) {
			return code[0] === '=';
		},
		isComment: function(code) {
			return code[0] === '*';
		},
		trim: function(str) {
			return str.replace(/^(\t|\n|\r)*/gm, '').replace(/(\t|\n|\r)*$/gm, '');
		}
	};

	var jstemplate = function(html) {
		var evaler = new Evaler(html);
		evaler.run();
		var code = evaler.getCode();
		var func;
		try {
			func = new Function('__data', code);
		}
		catch(e) {
			e.code = code;
			throw e;
		}
		return function(data) {
			try {
				return func.call(data, data);
			}
			catch(e) {
				e.code = code;
				throw e;
			}
		};
	};

	return jstemplate;
}));
