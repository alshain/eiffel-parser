var gulp = require("gulp");

var peg = require('gulp-peg');
var plumber = require('gulp-plumber');
var rename = require("gulp-rename");


var reload = require("browser-sync").reload;

var config = require("../config");

gulp.task("peg", ["cleanPeg"], function() {
  gulp.src("src/grammar/eiffel.pegjs")
    .pipe(plumber())
    .pipe(peg({
        allowedStartRules: config.allowedStartRules,
        exportVar: "eiffel.parser",
      }))
    .pipe(rename("parser.js"))
    .pipe(gulp.dest("./dist"))
    .pipe(reload({stream: true}))
});
