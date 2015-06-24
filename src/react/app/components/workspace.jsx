let React = require('react');
let mui = require('material-ui');
let LinearProgress = mui.LinearProgress;
import {Tabs, Tab} from 'material-ui';
let Editor = require('./editor.jsx');
var FileDragAndDrop = require('react-file-drag-and-drop');

var Workspace = React.createClass({
  render: function () {
    var workspace: eiffel.app.Workspace = this.props.workspace;

    return (
      <Tabs>
        {
          workspace.files.map(x => <Tab label={x.filename}>
            <Editor workspace={workspace} file={x} initialCode={x.code} updateCode={x.updateCode.bind(x)} />

          </Tab>)
        }
      </Tabs>

    );
  }
});

module.exports = Workspace;
