var gulp = require('gulp'),
    jshint = require('gulp-jshint')
    rename = require('gulp-rename')
    uglify = require('gulp-uglify'),
	replace = require('gulp-replace');
	
var getDate = function() {
  var date = new Date();

  var year = date.getFullYear().toString();
  var month = ('0' + (date.getMonth() + 1)).slice(-2);
  var day = ('0' + date.getDate()).slice(-2);

  return [year, month, day].join('-');
};

gulp.task('compress', function() {
  var p = require('./package.json');
  var date = new Date();
  gulp.src('src/*.js')
    .pipe(uglify({
		preserveComments: 'license'
	}))
	.pipe(replace(/@VERSION/, p.version))
	.pipe(replace(/@DATE/, getDate()))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'))
});

gulp.task('jslint', function() {
  return gulp.src(['src/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch('./src/*.js', ['compress']);
});

gulp.task('default', function() {
    gulp.start('jslint', 'compress');
});