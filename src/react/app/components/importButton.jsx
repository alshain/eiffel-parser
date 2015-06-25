let React = require('react');
let mui = require('material-ui');
import {RaisedButton, Tab} from 'material-ui';
let InlineCss = require('react-inline-css');
var FileDragAndDrop = require('react-file-drag-and-drop');
var Codemirror = require('react-codemirror');

var ImportButton = React.createClass({
  componentDidMount: function() {
    var that = this;

},

  render: function () {
    return (
      <RaisedButton style={{float: 'left', margin: '10px 24px', 'marginRight': '0'}} {...this.props} ref="button" label="Import Files" />
    );

  }
});

module.exports = ImportButton;
