
/* Notes:
   - gulp/tasks/browserify.js handles js recompiling with watchify
   - gulp/tasks/browserSync.js watches and reloads compiled files
*/

var gulp   = require('gulp');
var config = require('../config');

gulp.task('watch-react', ['setWatch', 'browserSync'], function() {
  gulp.watch("./src/react/app/**/*", ['build-react']);
  gulp.watch(config.markup.src, ['markup']);
});
