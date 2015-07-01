let React = require('react');
let mui = require('material-ui');
let LinearProgress = mui.LinearProgress;


var Sidebar = React.createClass({
  getInitialState: function() {
    return {
      hierarchy: undefined,
    };
  },
  componentDidMount: function() {
    console.log("here");
    this.props.editor.onAstHierarchyChange.subscribe((hierarchy) => {
      console.log("here");
      this.setState({hierarchy});
    });
  },
  render: function () {
    var model = this.props.model;

    return (
      <div className="eiffel-sidebar">
        {this.state.hierarchy ? this.state.hierarchy.map(ast => <div>{ast.constructor.name}</div>) : ""}

      </div>
    );
  }
});

module.exports = Sidebar;
