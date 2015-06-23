let React = require('react');
let mui = require('material-ui');
let LinearProgress = mui.LinearProgress;
var FileDragAndDrop = require('react-file-drag-and-drop');

var Example = React.createClass({

  handleDrop: function (dataTransfer) {
    var files = dataTransfer.files;
    var length = dataTransfer.items.length;
    for(var i = 0; i < length; i++) {
      console.log(dataTransfer.items[i].webkitGetAsEntry());
    }

    console.log(dataTransfer.files.length);
    console.log(dataTransfer.items.length);


    // Do something with dropped files...
  },

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

module.exports = Example;
