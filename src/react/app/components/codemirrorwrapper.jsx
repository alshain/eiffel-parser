let React = require('react');
let mui = require('material-ui');
let InlineCss = require('react-inline-css');
var FileDragAndDrop = require('react-file-drag-and-drop');
var Codemirror = require('react-codemirror');
let {Paper} = mui;

require('../../../../node_modules/react-codemirror/node_modules/codemirror/mode/eiffel/eiffel');


var Wrapper = React.createClass({
  shouldComponentUpdate: function() {
    return false;
  },

  componentDidMount: function() {
    this.codeMirror = this.refs.cm.codeMirror;
  },

  render: function () {
    return (
        <Codemirror ref="cm" {...this.props} />
    );

  }
});

module.exports = Wrapper;