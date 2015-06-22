var gulp = require('gulp');
var del = require('del');

gulp.task("clean", ["cleanCollected", "cleanTypescript", "cleanParser", "cleanBuiltin", "cleanVees"], function(cb) {
  del(["dist", "test/tmp", ".tmp"], cb);
});

gulp.task("cleanPeg", function(cb) {
  del(["dist/parser.js"], cb);
});

gulp.task("cleanTypescript", function(cb) {
  del(["dist/typescript.js"], cb);
});

gulp.task("cleanTypescriptTests", function(cb) {
  del(["test/all.js"], cb);
});

gulp.task("cleanParser", function(cb) {
  del(["dist/parser.js"], cb);
});

gulp.task("cleanBuiltin", function(cb) {
  del(["dist/builtin.js"], cb);
});

gulp.task("cleanVees", function(cb) {
  del(["dist/builtin.js"], cb);
});


gulp.task("cleanCollected", function(cb) {
  del(["test/tmp"], cb);
});
