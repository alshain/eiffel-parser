let React = require('react');
let mui = require('material-ui');
let LinearProgress = mui.LinearProgress;
import {Tabs, Tab} from 'material-ui';
let Editor = require('./editor.jsx');
let Statusbar = require('./statusbar.jsx');
let Sidebar = require('./sidebar.jsx');
var FileDragAndDrop = require('react-file-drag-and-drop');

var Workspace = React.createClass({
  propTypes: {
    style: React.PropTypes.object,
  },
  render: function () {
    var workspace: eiffel.app.Workspace = this.props.workspace;


    return (
      <div style={this.props.style}>
        <Tabs flexContent={true} tabItemContainerStyle={{backgroundColor: workspace.hasError? '#37474F' : '#37474F'}}>
          {
            workspace.files.map((x, i) => {
              return <Tab style={{backgroundColor: x.hasError ? '#C62828': '#607D8B'}}
                          onActive={() => x.onActivate.trigger(this.refs["tab" + i].codeMirror)} label={x.filename}>
                <div className="eiffel-tab">
                  <Editor ref={"tab" + i} style={{display: 'flex', flex: '1', flexDirection: 'column'}}
                          workspace={workspace} file={x} initialCode={x.code} updateCode={x.updateCode.bind(x)}/>
                  <Sidebar editor={x}/>
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
