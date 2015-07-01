let React = require('react');
let mui = require('material-ui');
let LinearProgress = mui.LinearProgress;
let AstExplanation = require('./ast-explanation.jsx');

var Sidebar = React.createClass({
  getInitialState: function() {
    return {
      parentsToNode: undefined,
      nodeToParent: undefined,
      nodeToExplanation: new Map(),
    };
  },
  componentDidMount: function() {
    console.log("here");
    this.props.editor.onAstHierarchyChange.subscribe((parentsToNode) => {
      let nodeToParent = undefined;
      let nodeToExplanation = new Map();

      if (parentsToNode) {
        nodeToParent = parentsToNode.reverse();


        for (let i = 0; i < nodeToParent.length; i++) {
          let subArray = nodeToParent.slice(i);
          nodeToExplanation.set(subArray[0], new eiffel.explain.AstExplanation(subArray));
        }
      }

      this.setState({parentsToNode, nodeToParent, nodeToExplanation});
    });
  },
  render: function () {
    let model = this.props.model;
    let explanation = "";

    if (this.state.nodeToParent) {
      if (this.state.nodeToParent.length > 0) {
        explanation = <div>
          Your cursor is currently inside the following structure:
          {this.state.parentsToNode.map(ast => <AstExplanation data={this.state.nodeToExplanation.get(ast)} />)}
          </div>;
      }
      else {
        explanation = "You can create a class here.";
      }
    }
    else {
      explanation = "At this time, no information is available";
    }

    return (
      <div className="eiffel-sidebar">

        {explanation}
      </div>
    );
  }
});

module.exports = Sidebar;
