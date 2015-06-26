let React = require('react');
let mui = require('material-ui');
let {Paper} = mui;
let LinearProgress = mui.LinearProgress;
var FileDragAndDrop = require('react-file-drag-and-drop');

var Statusbar = React.createClass({
  render: function () {
    let model = this.props.model;

    let cx = React.addons.classSet;
    let classes = cx({
      'eiffel-statusbar': true,
      'eiffel-statusbar--error': this.props.hasError,
      'eiffel-statusbar--ok': !this.props.hasError,
    });

    return (
      <div className={classes} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <Paper zDepth={3} style={{width: 'calc(100% - 50px)', height: 'calc(100% - 50px)', display: 'flex', justifyContent: 'center', flexDirection: 'column', textAlign: 'center'}} className="statusbar__message">{this.props.message}</Paper>
      </div>
    );
  }
});

module.exports = Statusbar;
