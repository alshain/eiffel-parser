var gulp = require('gulp');
var watch = require('gulp-watch');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var merge = require('event-stream').merge;
var intercept = require('gulp-intercept');
var ts = require('gulp-typescript');
var peg = require('gulp-peg');
var rename = require("gulp-rename");
var browserSync = require('browser-sync');
var reload      = browserSync.reload;

var argv = require('yargs').argv;
var spawn = require('child_process').spawn;

// FIXME Remove absolute paths

var paths = {
  "vees": [
    'src/_intro.js',
    'src/main.js',
    'src/_outro.js',
  ],
  "builtin": [
    'src/eiffel/**/*.e',
  ],
  "typescript": [
    'src/ts/**/*.ts',
  ],

  "peg": [
    "src/grammar/eiffel.pegjs",
  ]

};

gulp.task("clean", ["cleanCollected", "cleanTypescript", "cleanParser", "cleanBuiltin", "cleanVees"], function(cb) {
  del(["dist", "test/tmp", ".tmp"], cb);
});

gulp.task("cleanPeg", function(cb) {
  del(["dist/parser.js"], cb);
});

gulp.task("cleanTypescript", function(cb) {
  del(["dist/typescript.js"], cb);
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


// gulp.task('default', ["clean"], function () {
//     return gulp.src('src/**/*.js')
//         .pipe(sourcemaps.init())
//         .pipe(babel())
//         .pipe(concat('all.js'))
//         .pipe(sourcemaps.write('.'))
//         .pipe(gulp.dest('dist'));
// });



gulp.task("peg", ["cleanPeg"], function() {
  gulp.src("src/grammar/eiffel.pegjs")
    .pipe(peg({
        allowedStartRules: ["start", "Expression", "Type"],
        exportVar: "eiffel.parser",
      }))
    .pipe(rename("parser.js"))
    .pipe(gulp.dest("./dist"))
    .pipe(reload({stream: true}))
});

gulp.task('typescript', ["cleanTypescript"], function() {
   var tsResult = gulp.src('src/ts/**/*.ts')
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

gulp.task("all", ["peg", "typescript", "collectTests", "vees", "builtin"]);

gulp.task('build', ["peg", "typescript", "collectTests", "vees", "builtin"], function() {
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

function parseTest(varName) {
  var firstTest = "var " + varName  + " = [];\n";
  return intercept(function(file) {
    file.contents = new Buffer(firstTest + varName + ".push(" + JSON.stringify({filename: file.relative, content:file.contents.toString()}) + ");");
    firstTest = "";
    return file;
  });
}

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

gulp.task('default', ["all", "serve"]);

gulp.task("serve", function() {
 browserSync({
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

//
//gulp.task('auto-reload', function() {
//  var p;
//
//  gulp.watch('gulpfile.js', spawnChildren);
//  spawnChildren();
//
//  function spawnChildren(e) {
//    // kill previous spawned process
//    if(p) { p.kill(); }
//
//    // `spawn` a child `gulp` process linked to the parent `stdio`
//    p = spawn('gulp', [argv.task], {stdio: 'inherit'});
//  }
//});
