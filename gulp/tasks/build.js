var gulp = require('gulp');

gulp.task('build-react', ['browserify', 'markup', 'codemirror', 'assets', 'sass']);
