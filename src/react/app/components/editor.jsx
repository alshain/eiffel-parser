let React = require('react');
let InlineCss = require('react-inline-css');
var FileDragAndDrop = require('react-file-drag-and-drop');
var Codemirror = require('react-codemirror');

var Editor = React.createClass({
  getInitialState: function() {
    return {
      code: this.props.initialCode,
    }
  },

  updateCode: function() {
    console.log("updateCode", arguments);
  },

  render: function () {
    var style = {
      width: '100px',
      height: '100px'
    };
    var options = {
      lineNumbers: true
    };
    return (
        <InlineCss stylesheet="
          & > div {
            text-align: left;
          }
        ">
          <div>Filename: {this.props.name}
          <Codemirror value={this.state.code} onChange={this.updateCode} options={options} />
          </div>
        </InlineCss>
    );
  }
});

module.exports = Editor;
