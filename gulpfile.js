var gulp = require('gulp');
module.exports = gulp;
var watch = require('gulp-watch');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var ts = require('gulp-typescript');
var browserSync = require('browser-sync');
var reload      = browserSync.reload;

var argv = require('yargs').argv;
var spawn = require('child_process').spawn;

var parseTest = require("./gulp/util/parseTest");

// FIXME Remove absolute paths
var requireDir = require('require-dir');

// Require all tasks in gulp/tasks, including subfolders
requireDir('./gulp/tasks', { recurse: true });

var config = require("./gulp/config");
var paths = config.paths;

gulp.task('typescript', ["cleanTypescript"], function() {
   var tsResult = gulp.src(['src/ts/**/*.ts', '!test'])
                      .pipe(sourcemaps.init()) // This means sourcemaps will be generated
                      .pipe(ts({
                        //sortOutput: true,
                        target: "es6",
                           // ...
                      }));

    return tsResult
                .pipe(concat('typescript.js')) // You can use other plugins that also support gulp-sourcemaps
                .pipe(babel({blacklist: ["strict"]}))
                .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
                .pipe(gulp.dest('dist'))
                .pipe(reload({stream: true}));
});

gulp.task('typescriptTests', ["cleanTypescriptTests"], function() {
   var tsResult = gulp.src(paths["typescriptTests"])
                      .pipe(sourcemaps.init()) // This means sourcemaps will be generated
                      .pipe(ts({
                        //sortOutput: true,
                        target: "es6",
                           // ...
                      }));

    return tsResult
                .pipe(concat('all.js'))
                .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
                .pipe(gulp.dest('test'))
                .pipe(reload({stream: true}));
});

gulp.task("vees", ["cleanVees"], function() {
  return gulp.src(paths["vees"])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat("vees.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist"))
    .pipe(reload({stream: true}));
});

gulp.task("builtin", ["cleanBuiltin"], function() {
  return gulp.src(paths["builtin"])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(parseTest("__eiffel_builtin"))
    .pipe(concat("builtin.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist"))
    .pipe(reload({stream: true}));
});

gulp.task("all", ["peg", "typescript", "typescriptTests", "collectTests", "vees", "builtin"]);

gulp.task('build', ["peg", "typescript", "typescriptTests", "collectTests", "vees", "builtin"], function() {
  return gulp.src([
      'src/_intro.js',
      'dist/typescript.js',
      '.tmp/grammar.js',
      'src/main.js',
      'src/eiffel/**/*.js',
      'src/_outro.js',
    ])
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(concat("eiffel-parser.js"))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist"));
});

gulp.task('default', ["all", "serve"]);

gulp.task("serve", function() {
 browserSync.create().init({
      open: false,
      server: "./",
      startPath: "test/all.html",
  });

  gulp.watch([
    "src/*.html",
    "test/**/*.html",
    "test/all.js",
  ]).on('change', reload);

  watch(paths["vees"], function() {
    gulp.start("vees");
  });

  for (var task in paths) {
    if (paths.hasOwnProperty(task)) {
      watch(paths[task], function(task) {
        return function() {
          gulp.start(task);
        }
      }(task))
    }
  }


  watch(["test/tests/**/*.e"], function() {
    gulp.start("collectTests");
  });
});
