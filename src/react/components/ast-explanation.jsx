let React = require('react');
let mui = require('material-ui');
import {Paper, RaisedButton, Tab, IconButton} from 'material-ui';

var AstExplanation = React.createClass({
  render: function () {
    return (
      <Paper>
        Title: {this.props.title}
      </Paper>
    );

  }
});

module.exports = AstExplanation;
