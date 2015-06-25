let React = require('react');
let mui = require('material-ui');
let LinearProgress = mui.LinearProgress;
var FileDragAndDrop = require('react-file-drag-and-drop');

var Statusbar = React.createClass({
  render: function () {
    var model = this.props.model;

    return (
      <div className="eiffel-statusbar">
       Statusbar
      </div>
    );
  }
});

module.exports = Statusbar;
