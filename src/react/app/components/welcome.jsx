/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');
let mui = require('material-ui');
import {Paper, Tab, Tabs} from 'material-ui';
let LoadingScreen = require('./loading.jsx');
let Editor = require('./editor.jsx');
var  i = 1;
let Welcome = React.createClass({

  render: function() {

    return (
      <Paper zDepth={4} rounded={false} style={{width: '50%'}}>
        Drag some Eiffel files here to start
      </Paper>
    );
  },

});

module.exports = Welcome;
