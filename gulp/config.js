var dest = './dist',
  src = './src',
  mui = './node_modules/material-ui/src',
  codemirror = './node_modules/react-codemirror/node_modules/codemirror';

module.exports = {
  paths: {
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
    "typescriptTests": [
      'test/**/*.ts',
    ],
    "peg": [
      "src/grammar/eiffel.pegjs",
    ]

  },

  allowedStartRules: [
    "start",
    "Expression",
    "Type",
    "ParentGroup",
  ],
  browserSync: {
    server: {
      // We're serving the src folder as well
      // for sass sourcemap linking
      baseDir: [dest, src],
      middleware: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      },
    },
  },
  markup: {
    src: src + "/www/**",
    dest: dest
  },
  browserify: {
    // Enable source maps
    debug: true,
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/react/app.jsx',
      dest: dest,
      outputName: 'browserify.js'
    }]
  },
  sass: {
    src: src + "/css/**/*.scss",
    dest: dest + "/css",
  },
  assets: {
    src: "./assets/**",
    dest: dest + "/assets",
  },
  codemirror: [
    [codemirror + "/theme/neat.css", dest + "/codemirror"],
    [codemirror + "/lib/codemirror.css", dest + "/codemirror"],
  ],
  state: {
    isWatching: false,
  }
};
