let React = require('react');
let mui = require('material-ui');
let LinearProgress = mui.LinearProgress;
var FileDragAndDrop = require('react-file-drag-and-drop');

var Loading = React.createClass({
  render: function () {
    var model = this.props.model;

    let containerStyle = {
      textAlign: 'center',
      paddingTop: '200px'
    };

    return (
    <div style={containerStyle}>
      <h1>eiffel-parser</h1>
      <h2>getting things ready...</h2>
      {
        <LinearProgress mode="determinate" value={model.loadingProgress} />
      }
    </div>
    );
  }
});

module.exports = Loading;
