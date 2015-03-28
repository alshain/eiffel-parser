module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    clean: [
      "dist",
      ".tmp",
      "test/tmp"
    ],

    ts: {
      default: {
        src: ["src/ts/**/*.ts"],
        outDir: ".tmp/ts",
      },
    },

    concat_sourcemap: {
      options: {
        separator: "\n\n",
        sourceRoot: "..",
      },
      lint: {
        src: [
          'src/_intro.js',
          'src/main.js',
          'src/eiffel/**/*.js',
          'src/_outro.js',
          "src/eiffel/**/*.js",
        ],
        dest: '.tmp/lint.js'
      },

      dist: {
        src: [
          'src/_intro.js',
          '.tmp/ts/**/*.js',
          '.tmp/grammar.js',
          'src/main.js',
          'src/eiffel/**/*.js',
          'src/_outro.js',
          "src/eiffel/**/*.js",
        ],
        dest: 'dist/<%= pkg.name.replace(".js", "") %>.js'
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name.replace(".js", "") %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        sourceMap: true,
        sourceMapIn: "dist/eiffel-parser.js.map"
      },
      dist: {
        files: {
          'dist/<%= pkg.name.replace(".js", "") %>.min.js': ['<%=concat_sourcemap.dist.dest %>']
        }
      }
    },

    qunit: {
      files: ['test/*.html']
    },

    jshint: {
      files: ['.tmp/lint.js'],
      options: {
        globals: {
          console: true,
          module: true,
          document: true
        },
        jshintrc: '.jshintrc',
        reporter: './node_modules/jshint-path-reporter',
      }
    },

    watch: {
      files: [
        'Gruntfile.js',
        'src/grammar/eiffel.pegjs',
        'src/**/*.js',
        "src/ts/**/*.ts",
        'test/**/*.js',
        'test/**/*.e',
      ],
      tasks: ['toolchain']
    },

    collectTests: {
      syntax: {
        files: [
          { src: "test/tests/parsing/**/*.ok.e", varName:  "okTests"},
          { src: "test/tests/parsing/**/*.nok.e", varName: "nokTests"},
        ]
      }
    },
    peg: {
      eiffel: {
        src: "src/grammar/eiffel.pegjs",
        dest: ".tmp/grammar.js"
      },

      options: {
        allowedStartRules: ["start", "Expression", "Type"],
        wrapper: function (src, parser) {
          return 'generatedParser = ' + parser + ';';

        }
      }
    },

    browserSync: {
      default_options: {
        bsFiles: {
          src: [
            "dist/*",
            "src/**/*.html",
            "src/**/*.css",
            "test/**/*.html",
            "test/tmp/collected.js",
            "test/all.js",
          ]
        },
      },
      options: {
        watchTask: true,
        server: {
            baseDir: "./"
        },
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concat-sourcemap');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-peg');
  grunt.loadNpmTasks('grunt-browser-sync');
  grunt.loadNpmTasks('grunt-ts');


  grunt.registerMultiTask('collectTests', function() {
    var target = this.target;
    var results = [];
    var dest = "test/tmp/collected.js";
    // Initialize results with different varNames
    var varSets = this.files.map(function(fileSet) { return fileSet.varName; });
    varSets.forEach(function(varName) { results[varName] = []});
    this.files.forEach(function (fileSet) {
      var src = fileSet.src;
      var OKs = src.map(function(file) {
        return {filename:file, content:grunt.file.read(file)};
      });
      Array.prototype.push.apply(results[fileSet.varName], OKs);
    });
    var fileOutput = "";
    varSets.forEach(function(varName) {
      fileOutput += "var " + varName + " = " + JSON.stringify(results[varName]) + ";\n";

    });
    grunt.file.write(dest, fileOutput);
  });
  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('toolchain', ['clean', 'ts', 'collectTests', 'peg', 'concat_sourcemap', 'jshint', 'qunit', 'uglify']);
  grunt.registerTask('default', ['toolchain', 'browserSync', 'watch']);
};
