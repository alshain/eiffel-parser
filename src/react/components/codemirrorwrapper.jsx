let React = require('react');
let mui = require('material-ui');
var Codemirror = require('react-codemirror');
let {Paper} = mui;

var Wrapper = React.createClass({
  shouldComponentUpdate: function() {
    return false;
  },

  componentDidMount: function() {
    this.codeMirror = this.refs.cm.codeMirror;
  },

  render: function () {
    return (
        <div style={this.props.style}>
          <Codemirror ref="cm" {...this.props} />
        </div>
    );

  }
});

module.exports = Wrapper;
