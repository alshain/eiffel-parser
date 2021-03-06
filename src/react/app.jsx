(function () {
  let React = require('react/addons');
  let injectTapEventPlugin = require('react-tap-event-plugin');
  let Main = require('./components/main.jsx'); // Our custom react component
  let DragDrop = require('./components/loading.jsx');
  let sTree = require('s-tree');
  window.sTree = sTree;

  //Needed for React Developer Tools
  window.React = React;

  //Needed for onTouchTap
  //Can go away when react 1.0 release
  //Check this repo:
  //https://github.com/zilverline/react-tap-event-plugin
  injectTapEventPlugin();

  // Render the main app react component into the document body.
  // For more details see: https://facebook.github.io/react/docs/top-level-api.html#react.render
  var model = new eiffel.app.Model();
  function render() {
    React.render(<Main model={model} />, document.getElementById("reactTarget"));
  }
  render();
  model.subscribe(render);
  /*
  // Comment/uncomment this to prevent accidental reloads
  window.onbeforeunload = function (event) {
    return "Rebooting this app will take some time.";
  }
   */


})();
