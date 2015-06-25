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
        <Tabs flexContent={true}>
          {
            workspace.files.map((x, i) => <Tab onActive={() => x.onActivate.trigger(this.refs["tab" + i].codeMirror)} label={x.filename}>
              <div className="eiffel-tab">
                <Editor ref={"tab" + i} style={{display: 'flex', flex: '1', flexDirection: 'column'}} workspace={workspace} file={x} initialCode={x.code} updateCode={x.updateCode.bind(x)} />
                <Sidebar />
              </div>
              <Statusbar />
            </Tab>)
          }
        </Tabs>
      </div>
    );
  }
});

module.exports = Workspace;
