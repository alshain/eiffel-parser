var gulp = require('gulp');
var state = require("../config");

gulp.task('setWatch', function() {
  state.isWatching = true;
});
