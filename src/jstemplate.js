/*!
* Simple JavaScript template engine
* https://github.com/JoniJnm/jstemplate
*
* Copyright JoniJnm.es
* Released under the GPL-2.0 license.
*
* Version: @VERSION
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

	var Parser = function(html) {
		this.html = html;
		this.source = '';

		this.startBlocks = ['if', 'for', 'while', 'foreach'];
		this.continueBlocks = ['else', 'else if', 'elseif'];
		this.reservedWords = ['break', 'continue', 'debugger', 'var', 'let'];

		this.startBlockRegex = new RegExp('^('+this.startBlocks.join('|')+') ');
		this.continueBlockRegex = new RegExp('^('+this.continueBlocks.join('|')+')( |$)');
		this.rawCodeRegexs = [
			new RegExp('^('+this.reservedWords.join('|')+')( |$)'),
			/^[\w\.$]+\s*=[^=]/, //asign value to var
			/^[\w\.$]+\s*(\+\+|\-\-)$/ //in/decrease value
		];
		this.squareBracketRegex = /\[[^\[\]]+\]/g;

		this.eachRegex = /^foreach ([\w\._]+) as ([\w_]+)$/;
	};

	Parser.prototype = {
		add: function(code) {
			this.source += code;
			this.source += '\n';
		},
		initSource: function() {
			this.add('with(self) {');
			this.add('var __html = "";');
		},
		getSource: function() {
			return this.source;
		},
		endSource: function() {
			this.add('}');
			this.add('return __html;');
		},
		addRawHTML: function(html) {
			if (this.trim(html)) {
				html = this.beauty(html);
				this.add('__html += '+JSON.stringify(html)+';');
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
			this.add('__html += this.encode('+code+');');
		},
		addForcedReturnedRawCode: function(code) {
			this.add('__html += '+code.substr(1)+';');
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
			this.initSource();
			var posStart = 0;
			var html = this.html;
			var that = this;
			html = html.replace(/<script[^>]*>([\s\S]+?)<\/script>/g, function(match, code) {
				that.add(code); //add script code
				return ''; //remove script from html
			});
			html.replace(/\{([\s\S]+?)\}/g, function(match, code, pos) {
				code = code.replace(/^ +/, '').replace(/ +$/, ''); //trim spaces
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
				else if (that.isForcedReturnRawCode(code)) {
					that.addForcedReturnedRawCode(code);
				}
				else if (that.isRawCode(code)) {
					that.addRawCode(code);
				}
				else {
					that.addReturnedCode(code);
				}
				posStart = pos + match.length;
				return match;
			});
			this.addRawHTML(html.substr(posStart));
			this.endSource();
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
			while (this.squareBracketRegex.test(code)) {
				code = code.replace(this.squareBracketRegex, '');
				console.log(code);
			}

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
		isForcedReturnRawCode: function(code) {
			return code[0] === '.';
		},
		isComment: function(code) {
			return code[0] === '*';
		},
		trim: function(str) {
			return str
			.replace(/^[\s]+/gm, '')
			.replace(/[\s]+$/gm, '');
		},
		beauty: function(str) {
			return str
			.replace(/[\s]+/gm, ' ');
		}
	};

	var Render = function(func, source) {
		this.func = func;
		this.source = source;
	};

	Render.prototype = {
		rende: function(data) {
			try {
				return this.func.call(this, data);
			}
			catch(e) {
				e.source = this.source;
				throw e;
			}
		},
		getSource: function() {
			return this.source;
		},
		encode: function(html) {
			if (html && html.toString) {
				return html.toString()
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/'/g, '&#039;')
				.replace(/"/g, '&quot;');
			}
			else {
				return html;
			}
		}
	};

	var jstemplate = {
		parse: function(html) {
			var parser = new Parser(html);
			parser.run();
			var source = parser.getSource();
			var func;
			try {
				func = new Function('self', source);
			}
			catch(e) {
				e.source = source;
				throw e;
			}

			var render = new Render(func, source);
			return render;
		}
	};

	return jstemplate;
}));
