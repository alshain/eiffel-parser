/* eiffel-parser.js main */

// Base function.
var vees = function() {
  // Add functionality here.
  var parser = generatedParser;

  return {
    parser: parser
  
  };
};


// Version.
vees.VERSION = '0.0.0';


// Export to the root, which is probably `window`.
root.vees = vees();
