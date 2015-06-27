var browserSync = require('browser-sync');
var gulp        = require('gulp');
var plumber     = require('gulp-plumber');
var sass        = require('gulp-sass');
var state       = require('../config').state;
var config      = require('../config').sass;

gulp.task('sass', function() {
  return gulp.src(config.src)
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.stream());
});
