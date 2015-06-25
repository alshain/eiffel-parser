/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');
let mui = require('material-ui');
let LoadingScreen = require('./loading.jsx');
let Welcome = require('./welcome.jsx');
let {ToolbarGroup, Toolbar, RaisedButton, ToolbarSeparator, Dialog } = mui;
let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;
import ImportButton from './importButton.jsx';
let Workspace = require('./workspace.jsx');
var  i = 1;
let Main = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getInitialState : function() {
    return {
      showTutorial: true,
    };
  },

  getChildContext: function() {
    // Required for material-ui
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },

  componentWillMount: function() {
    // Required for material-ui
    ThemeManager.setPalette({
      accent1Color: Colors.deepOrange500
    });
  },

  render: function() {
    var model = this.props.model;


    var mainContent;
    if (eiffel.app.debug || model.isInitialized) {
      let errorDialogue = undefined;
      let tutorialDialogue = undefined;
      if (window.location.protocol === 'file:') {
        errorDialogue = <Dialog actionFocus="ok" title="Import unavailable" openImmediately={true} modal={true} actions={[{text: 'Ok', ref: 'ok'}]}>
          Sorry, but you cannot import files when accessing this web page directly from your local hard drive.
        </Dialog>;
      }
      if (this.state.showTutorial) {
      }

      return (
        <div>
          { errorDialogue }
          <Toolbar>
            <ToolbarGroup key={0} float="left">

            </ToolbarGroup>
            <ToolbarGroup key={1} float="right">
              <ToolbarSeparator />
              <ImportButton model={model} importFile={model.activeWorkspace.importFile.bind(model.activeWorkspace)} />
              <RaisedButton label="New Workspace" />
            </ToolbarGroup>
          </Toolbar>
          {
            model.workspaces.map(w => <Workspace workspace={w} />)
          }
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
