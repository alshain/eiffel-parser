let React = require('react');
let mui = require('material-ui');
import {RaisedButton, Tab} from 'material-ui';
let InlineCss = require('react-inline-css');
let FileDragAndDrop = require('react-file-drag-and-drop');
let Codemirror = require('react-codemirror');
let eol = require('eol');

var ImportButton = React.createClass({
  componentDidMount: function() {
    var that = this;

  },
  _click: function(e) {
    let node = React.findDOMNode(this.refs.fileInput);
    node.click(arguments);
  },

  _onChange: function(e) {
    console.log(e.target.files);
    Array.prototype.forEach.call(e.target.files, file => {
      var reader = new FileReader();
      reader.onload = (e) => {
        this.props.onFileRead(file.name, eol.lf(e.target.result));
        React.findDOMNode(this.refs.form).reset();
      };
      reader.readAsText(file);
    });
  },

  render: function () {
    return (
      <RaisedButton onClick={this._click} style={{float: 'left', margin: '10px 24px', 'marginRight': '0'}} {...this.props} ref="button" label="Import Files" >
        <form ref="form"><input onChange={this._onChange} ref="fileInput" type="file" multiple style={{display: 'none'}} /></form>
      </RaisedButton>
    );

  }
});

module.exports = ImportButton;