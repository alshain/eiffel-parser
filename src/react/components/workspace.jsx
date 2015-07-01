let React = require('react');
let mui = require('material-ui');
let LinearProgress = mui.LinearProgress;
import {Tabs, Tab, FloatingActionButton} from 'material-ui';
let Editor = require('./editor.jsx');
let Statusbar = require('./statusbar.jsx');
let Sidebar = require('./sidebar.jsx');

var Workspace = React.createClass({
  propTypes: {
    style: React.PropTypes.object,
  },
  render: function () {
    var workspace: eiffel.app.Workspace = this.props.workspace;
    var activeTabIndex = workspace.files.indexOf(workspace.activeFile);

    return (
      <div style={this.props.style}>
        <Tabs flexContent={true} tabItemContainerStyle={{backgroundColor: workspace.hasError? '#37474F' : '#37474F'}}>
          {
            workspace.files.map((x, i) => {
              return <Tab key={x.reactKey} reactKey={x.reactKey} style={{backgroundColor: x.hasError ? '#C62828': '#607D8B'}}
                          touchTapOnForceActivate={true}
                          onActive={() => x.onActivate.trigger()} label={x.getFilename()}>
                <div key={x.reactKey} className="eiffel-tab">
                  <Editor ref={"tab" + i} style={{display: 'flex', flex: '1', flexDirection: 'column'}}
                          workspace={workspace} file={x} initialCode={x.code} updateCode={x.updateCode.bind(x)}/>
                  <Sidebar key={x.reactKey} editor={x}/>
                </div>
              </Tab>;
            })
          }
        </Tabs>
        <Statusbar hasError={workspace.hasError} message={workspace.hasError ? "Error :(" : "All Good :)" } />
      </div>
    );
  }
});

module.exports = Workspace;
