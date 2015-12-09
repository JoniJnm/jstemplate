# jstemplate
Simple JavaScript template engine

Allowed statements: if, for, while, else, else if  
Additional statements: elseif, foreach {array|obj} as {var_name}

# Full example

## template.tpl

```html
<h1>{name.toUpperCase()}</h1>
<div>
	My age is: <span>{age}</span>
	{if skills}
		{*I'm a comment*}
		<div>
			Skills: <span>{skills.length}</span>
		</div>
		<ul>
			{foreach skills as skill}
				<li>{skill}</li>
			{/foreach}
		</ul>
	{else}
		<div>No skills</div>
	{/if}

	<div>
		More data
	</div>
	<ul>
	{foreach moreData as value}
		<li>{_key}: {value}</li> {*_key is a special var, you can use _i too*}
	{/foreach}
	</ul>
</div>
<div style="color: {color}">Now: {(new Date()).toString()}</div>
```

## index.html

```html
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
<script src="../src/jstemplate.js"></script>

<div id="user"></div>
```

## test.js

```javascript
$.ajax({ //get html template
	url: 'template.tpl',
	dataType: 'text' //plain text format!
}).done(function(html) {
	'use strict';

	var template = jstemplate.parse(html); //get template renderer
	var user = { //define user
		name: 'Joni',
		color: 'red',
		age: 25,
		skills: [
			'JavaScript', 'HTML', 'CSS'
		],
		moreData: {
			param1: 'value1',
			param2: 'value2'
		}
	};

	var output = template.rende(user); //get html output
	$('#user').html(output); //show output
});
```

# More examples

## For

```html
<ul>
	{for var i = 0; i < 6; i++}
		{if i % 2 != 0}
			{continue}
		{/if}
		<li>{i}</li>
	{/for}
</ul>
```

## While

```html
<ul>
	{var i=0}
	{maxShow = 3}
	{while i <= 5}
		<li>{i}</li>
		{if i+1 == maxShow}
			{break}
		{/if}
		{i++}
	{/while}
</ul>
```

## Functions

```html
<script>
var plus = function(n1, n2) {
	return n1 + n2;
};
</script>

<div>1+2 = {plus(1, 2)} </div>
<div>2+2 = {plus(2, 2)} </div>
<div>3+2 = {plus(3, 2)} </div>
```

Do not declare functions directly, store them in vars

```javascript
//BAD CODE
function plus(n1, n2) {
	return n1 + n2;
}
```

## Force return value

jstemplate tries to know if code should be displayed. You can force it.

```html
{var i=0}
{i++} {*i=1 and the value 1 is not displayed*}
{=i++} {*Forced return, i=2 and the value 1 is displayed*}
```

You can also force code to be not displayed.

```html
<script>
var miFunc = function() {
	console.log('Testing');
};
</script>

{miFunc()} {*Will show 'undefined'*}
{#miFunc()} {*Not displayed*}
```

## Force return raw value

jstemplate encode the values, you can force it to use raw values

```html
{var html = '<b>Hello!</b>'}
{html} {*Ouput: &lt;b&gt;Hello!&lt;/b&gt;*}
{.html} {*Ouput: <b>Hello!</b>*}
```

## self

```html
{foreach self as number}
	{number}
{/foreach}
```

```javascript
var tpl = jstemplate.parse(html);
var output = tpl.rende([5,7,8,10]);
```

## Debug

You can debug code simply adding a {debugger}, also when an error occurs the code created is in the Error Object

```html
<ul>
{debugger} {*Debug here!*}
{foreach moreData as value}
	<li>{_key}: {value}</li>
{/foreach}
</ul>
```

```javascript
try {
	var template = jstemplate.parse(html);
	var output = template.rende(user); //get html output
	$('#user').html(output); //show output
}
catch(e) {
	//if there is an error in jstemplate, e.source has the code to eval
	console.error(e);
	if (e.source) {
		console.log(e.source);
	}
	throw e;
}
```

## Requirejs

```javascript
define(function(require, exports, module) {
	'use strict';

	var userHTML = require('text!my_templates/user.tpl'),
		jstemplate = require('vendor/jstemplate');

	var userTemplate = jstemplate.parse(userHTML);
	var rended = userTemplate.rende({
		name: 'Joni'
	});
	console.log(rended);
});
```

## Requirejs ([with plugin](https://github.com/JoniJnm/jstemplate/blob/master/src/tplparse.js))

```javascript
define(function(require, exports, module) {
	'use strict';

	var userTemplate = require('tplparse!my_templates/user');
	var rended = userTemplate.rende({
		name: 'Joni'
	});
	console.log(rended);
});
```
