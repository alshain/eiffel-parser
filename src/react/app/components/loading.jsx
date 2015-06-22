let React = require('react');
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
    var style = {
      width: '100px',
      height: '100px'
    };

    return (
      <div>
        <h1>Please drop your files</h1>
        <div style={style}>
          <FileDragAndDrop onDrop={this.handleDrop}>
            Drop files here...
          </FileDragAndDrop>
        </div>
      </div>
    );
  }
});

module.exports = Example;
