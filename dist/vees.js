(function(root, undefined) {

  root.eiffel.semantics.start();
function vees() {
  return {
    parser: eiffel.parser,
  }
}



// Export to the root, which is probably `window`.
root.vees = vees();

}(this));
