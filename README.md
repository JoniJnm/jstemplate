# jstemplate
Simple JavaScript template engine

Allowed statements: if, for, while, else, else if  
Additional statements: elseif, foreach {array|obj} as {var_name}

# Example

## template.html

```html
<h1>{=name.toUpperCase()}</h1>
<div>
	My age is: <span>{=age}</span>
	{if skills}
		{*I'm a comment*}
		<div>
			Skills: <span>{=skills.length}</span>
		</div>
		<ul>
			{foreach skills as skill}
				<li>{=skill}</li>
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
		<li>{=_key}: {=value}</li> {*_key is a special var, you can use _i too*}
	{/foreach}
	</ul>
</div>
<div style="color: {=color}">Now: {=(new Date()).toString()}</div>
```

## index.html

```html
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
<script src="../src/jstemplate.js"></script>

<div id="template" style="display:none">
	Here the template
</div>

<div id="user"></div>
```

## test.js

```javascript
$.ajax({ //get html template
	url: 'template.html',
	dataType: 'text' //plain text format!
}).done(function(html) {
	'use strict';

	//var jstemplate = require('jstemplate');
	var template = jstemplate(html); //get template renderer
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

	var output = template(user); //get html output
	$('#user').html(output); //show output
});
```

## For

```html
<ul>
	{for var i = 0; i < 6; i++}
		{if i % 2 != 0}
			{continue}
		{/if}
		<li>{=i}</li>
	{/for}
</ul>
```

## While

```html
<ul>
	{var i=0}
	{maxShow = 3}
	{while i <= 5}
		<li>{=i}</li>
		{if i+1 == maxShow}
			{break}
		{/if}
		{i++}
	{/while}
</ul>
```
