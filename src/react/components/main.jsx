/** In this file, we create a React component which incorporates components provided by material-ui */

let React = require('react');
let mui = require('material-ui');
let LoadingScreen = require('./loading.jsx');
let Welcome = require('./welcome.jsx');
let {AppBar, LeftNav, MenuItem, ToolbarGroup, Toolbar, RaisedButton, ToolbarSeparator, Dialog, FontIcon, CircularProgress } = mui;
let ThemeManager = new mui.Styles.ThemeManager();
let Colors = mui.Styles.Colors;
import ImportButton from './importButton.jsx';
let Workspace = require('./workspace.jsx');

let importOnDrop = require('../util/importOnDrop');

let Main = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getInitialState : function() {
    return {
      showTutorial: true,
      activeWorkspace: 0,
      loadingFromGithub: true,
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

    this.model = this.props.model;
    this.model.onInitialized.subscribe(() => {
      importOnDrop(document, (...args) => this.model.activeWorkspace.importFile(...args));
    });

    /*octokat.users("alshain", "repos").fetch().then((repos) => {
      repos.forEach(repo => {
        console.log("defaultBranch: ", repo.defaultBranch);
        repo.branches(repo.defaultBranch).fetch().then(branch => {
          console.log(branch.commit.sha);
          branch.trees(branch.commit.sha).fetch().then(tree => {
            console.log(tree);
          });
        });
        console.log(repo);
      });
    });*/
  },
  _onImport: function() {
    this.refs.importDialog.show();
  },

  render: function() {
    var model = this.props.model;


    if (eiffel.app.debug || model.isInitialized) {
      let errorDialogu = undefined;
      if (window.location.protocol === 'file:') {
        errorDialogue = <Dialog actionFocus="ok" title="Import unavailable" openImmediately={true} modal={true} actions={[{text: 'Ok', ref: 'ok'}]}>
          Sorry, but you cannot import files when accessing this web page directly from your local hard drive.
        </Dialog>;
      }
      if (this.state.showTutorial) {
        <CircularProgress mode="indeterminate" size={2} />
      }
      let buttonMargin = {marginLeft: '8px', marginRight: '0'};

      let importDialog = <Dialog ref="importDialog" title="Import example">

        </Dialog>;
      let examplesButton = <RaisedButton label="Examples"
                                         iconClassName="eiffel-icon-github"
                                         style={{marginRight: '0'}}
                                         onTouchTap={this._onImport} />;
      let menuItems = [
        { type: MenuItem.Types.SUBHEADER, text: 'Projects' },
      ];

      let appBar = <AppBar title='eiffel-parser' onLeftIconButtonTouchTap={() => this.refs.leftNav.toggle()} />;
      let leftNav = <LeftNav ref="leftNav" docked={false} menuItems={menuItems} selectedIndex={1} />;



      model.workspaces.forEach((workspace, i) => {
        menuItems.push({ text: 'Workspace ' + (i + 1), menuItemClassName: 'eiffel-icon-github', children: [<div>hello</div>] })
      });
      return (
        <div style={{display: 'flex', height: '100%', 'flexFlow': 'column'}}>
          { errorDialogu }
          {
            //importDialog
          }

          {
            // appBar
            // leftNav
          }

          <Toolbar>
            <ToolbarGroup key={0} float="left">
              {model.workspaces.map((w, i) => {
                let props = {};
                let iconClassName = iconClassName = w.hasError ? "eiffel-icon-error"  : "eiffel-icon-check";
                if (!w.active) {
                  props.backgroundColor = w.hasError ? '#FF8A80' : '#4CAF50';
                }
                else {
                  props.secondary = true;
                }

                return <RaisedButton iconClassName={iconClassName} style={buttonMargin} label={"Workspace " + (i + 1) + ""} {...props} onTouchTap={() => w.setActive()} />
              })}
            </ToolbarGroup>
            <ToolbarGroup key={1} float="right">
              <ToolbarSeparator />
              {
                // examplesButton
              }
              <ImportButton model={model} onFileRead={(...args) => model.activeWorkspace.importFile(...args)} />
              <RaisedButton label="New Workspace" onClick={model.addWorkspace.bind(model)} />
            </ToolbarGroup>
          </Toolbar>
          {
            model.workspaces.map(w => <Workspace style={{flex: 2, overflow:'auto', flexDirection: 'column', display: w.active ? 'flex' : 'none'}} workspace={w} />)
          }
      </div>
      );
    }
    else {
      return <LoadingScreen model={model} />;
    }
  },
});

module.exports = Main;
