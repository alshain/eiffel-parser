var intercept = require('gulp-intercept');


function parseTest(varName) {
  var firstTest = "var " + varName  + " = [];\n";
  return intercept(function(file) {
    file.contents = new Buffer(firstTest + varName + ".push(" + JSON.stringify({filename: file.relative, content:file.contents.toString()}) + ");");
    firstTest = "";
    return file;
  });
}

module.exports = parseTest;
