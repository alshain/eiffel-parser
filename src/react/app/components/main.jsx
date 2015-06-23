/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');
let mui = require('material-ui');
let LoadingScreen = require('./loading.jsx');
let Welcome = require('./welcome.jsx');
let ToolbarGroup = mui.ToolbarGroup;
let Toolbar = mui.Toolbar;
let RaisedButton = mui.RaisedButton;
let ToolbarSeparator = mui.ToolbarSeparator;
let Tabs = mui.Tabs;
let Tab = mui.Tab;
let Button = mui.Button;
let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;
let Editor = require('./editor.jsx');
var  i = 1;
let Main = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext: function() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentWillMount: function() {
    ThemeManager.setPalette({
      accent1Color: Colors.deepOrange500
    });
  },

  render: function() {
    var model = this.props.model;


    var mainContent;
    if (true || model.isInitialized) {
      return (
        <div>
          <Toolbar>
            <ToolbarGroup key={0} float="left">

            </ToolbarGroup>
            <ToolbarGroup key={1} float="right">
              <ToolbarSeparator />
              <RaisedButton label="Import Files" style={{margin: 0}} />
              <RaisedButton label="New Workspace" />
            </ToolbarGroup>
          </Toolbar>
          <Welcome />
      </div>
      );
    }
    else {
      return <LoadingScreen model={model} />;
    }
  },

  _handleTouchTap: function() {
    alert('1-2-3-4-5');
  }

});

module.exports = Main;
