var gulp = require('gulp');
var merge = require('merge-stream');
var config = require('../config').codemirror;

gulp.task('codemirror', function() {
  var copies = config.forEach(function (src__dest) {
    var src = src__dest[0];
    var dest = src__dest[1];
    return gulp.src(src).pipe(gulp.dest(dest));
  });
  merge.apply(null, copies);
});
