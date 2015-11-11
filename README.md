# jstemplate
Simple JavaScript template engine

Allowed statements: if, for, while, else, else if  
Additional statements: elseif, each <array> in <var_name>

```html
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
<script src="../src/jstemplate.js"></script>

<div id="template" style="display:none">
	<h1>{user.name.toUpperCase()}</h1>
	<div>
		My age is: <span>{user.age}</span>
		{if user.skills}
			<div>Skills: <span>{user.skills.length}</span></div>
			<ul>
				{each user.skills as skill}
					<li>{skill}</li>
				{/each}
			</ul>
		{else}
			<div>No skills</div>
		{/if}
	</div>
	<div>{otherParam}</div>
	<div>Now: {(new Date()).toString()}</div>
</div>

<div id="user"></div>
```

```javascript
var html = $('#template').html(); //get html template
var template = jstemplate(html); //get template renderer
var user = { //define user
	name: 'Joni',
	age: 25,
	skills: [
		'JavaScript', 'HTML'
	]
};
var output = template({ //get html uutput
	user: user,
	otherParam: 'testing'
})
$('#user').html(output); //show output
```
