let React = require('react');
let mui = require('material-ui');
let LinearProgress = mui.LinearProgress;
var FileDragAndDrop = require('react-file-drag-and-drop');

var Sidebar = React.createClass({
  render: function () {
    var model = this.props.model;

    return (
      <div className="eiffel-sidebar">
       Sidebar
      </div>
    );
  }
});

module.exports = Sidebar;
