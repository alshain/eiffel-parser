let React = require('react');
let mui = require('material-ui');
import {Paper, RaisedButton, Tab, IconButton} from 'material-ui';

var AstExplanation = React.createClass({
  render: function () {

    let context = this.props.data.context;
    let contextOutput = undefined;
    if (context && context.title) {
      contextOutput = <div>{context.title} - Technical: {this.props.data.node.constructor.name}<br />Context: {context.description}
      </div>;
    }
    else {
      contextOutput = this.props.data.node.constructor.name;
    }
    return (
      <Paper>

        { contextOutput }
      </Paper>
    );

  }
});

module.exports = AstExplanation;
