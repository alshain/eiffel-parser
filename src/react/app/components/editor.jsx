let React = require('react');
let mui = require('material-ui');
let InlineCss = require('react-inline-css');
var FileDragAndDrop = require('react-file-drag-and-drop');
var Codemirror = require('react-codemirror');
let {Paper} = mui;
let Wrapper = require('./codemirrorwrapper.jsx');

require('../../../../node_modules/react-codemirror/node_modules/codemirror/mode/eiffel/eiffel');


var Editor = React.createClass({
  getInitialState: function() {
    return {
      code: this.props.initialCode,
      hasError: false,
      message: "",
    }
  },

  componentDidMount: function() {
    this.codeMirror = this.refs.cm.codeMirror;
    this.props.file.onError = this._showError;
    this.props.file.onParseSuccessful = this._parseSuccessful;

    this.props.file.parse();
  },

  _showError(line, column, message) {
    this.setState({hasError: true, message: "Line " + line + ", Column: " + column + " " + message});
  },

  _parseSuccessful() {
    this.setState({hasError: false, message: ""});
  },

  render: function () {
    var style = {
      width: '100px',
      height: '100px'
    };
    var options = {
      lineNumbers: true,
      mode: "text/x-eiffel",
      theme: "neat",
    };
    let statusContent = undefined;

    if (this.state.hasError) {
      statusContent = <div>{"Parse error: " + this.state.message}</div>;
    }

    return (
      <div>Filename: {this.props.name}
        <Wrapper ref="cm" value={this.state.code} onChange={this.props.updateCode} options={options} />
        <Paper>
          {statusContent}
        </Paper>
      </div>
    );

  }
});

module.exports = Editor;
