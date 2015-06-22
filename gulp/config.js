var dest = './dist',
  src = './src',
  mui = './node_modules/material-ui/src';

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
      baseDir: [dest, src]
    },
    files: [
      dest + '/**'
    ]
  },
  markup: {
    src: src + "/react/www/**",
    dest: dest
  },
  browserify: {
    // Enable source maps
    debug: true,
    // A separate bundle will be generated for each
    // bundle config in the list below
    bundleConfigs: [{
      entries: src + '/react/app/app.jsx',
      dest: dest,
      outputName: 'browserify.js'
    }]
  },
  state: {
    isWatching: false,
  }
};
