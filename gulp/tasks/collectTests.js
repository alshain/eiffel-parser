var gulp = require("gulp");
var merge = require('event-stream').merge;

var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');

var reload = require("browser-sync").reload;


var parseTest = require("../util/parseTest");

gulp.task('collectTests', ["cleanCollected"], function() {
  return merge(
      gulp.src("test/tests/parsing/**/*.ok.e")
      .pipe(sourcemaps.init())
      .pipe(parseTest("okTests"))
    ,
      gulp.src("test/tests/parsing/**/*.nok.e")
      .pipe(parseTest("nokTests"))
    )
    .pipe(concat('test/tmp/collected.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./'))
    .pipe(reload({stream: true}));
});
