let React = require('react');
let mui = require('material-ui');
import {RaisedButton, Tab} from 'material-ui';
let InlineCss = require('react-inline-css');
var FileDragAndDrop = require('react-file-drag-and-drop');
var Codemirror = require('react-codemirror');

var ImportButton = React.createClass({
  componentDidMount: function() {
    var that = this;
    var ignoredDirectories = [".git", ".svn", "EIFGENs"];
    var button = this.refs.button;
    var node = React.findDOMNode(button);

    node.addEventListener('dragover', function (e) {
      e.preventDefault();
      e.currentTarget.classList.add('over-line');
    });

    node.addEventListener('dragleave', function (e) {
      e.preventDefault();
      e.currentTarget.classList.remove('over-line');
    });

    node.addEventListener('drop', function (e) {
      e.preventDefault();

      var length = e.dataTransfer.items.length;

      for (var i = 0; i < length; i++) {
        var entries = [];
        entries[0] = e.dataTransfer.items[i].webkitGetAsEntry();
        readDirectory(entries, "");
      }

      e.currentTarget.classList.remove('over-line');
    });


    // Recursive directory read
    function readDirectory(entries, path) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isDirectory) {
          if (ignoredDirectories.indexOf(entries[i].name) === -1) {
            var directoryReader = entries[i].createReader();
            getAllEntries(
              directoryReader,
              readDirectory,
              path + entries[i].name  + "/"
            );
          }
        } else {
          if (entries[i].name.endsWith(".e")) {
            entries[i].file(appendTextFile.bind(window, path), errorHandler);
          }
        }
      }
    }
    function getAllEntries(directoryReader, callback, path) {
      var entries = [];

      var readEntries = function () {
        directoryReader.readEntries(function (results) {
          if (!results.length) {
            entries.sort();
            callback(entries, path);
          } else {
            entries = entries.concat(toArray(results));
            readEntries();
          }
        }, errorHandler);
      };

      readEntries();
    }

    function appendTextFile(path, file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        that.props.importFile(path + file.name, e.target.result);
      };
      reader.readAsText(file);
    }


    function toArray(list) {
      return Array.prototype.slice.call(list || [], 0);
    }

    function errorHandler(e) {
      console.log('FileSystem API error code: ' + e.code, e)
    }
},

  render: function () {
    return (
      <RaisedButton style={{float: 'left', margin: '10px 24px', 'marginRight': '0'}} {...this.props} ref="button" label="Import Files" />
    );

  }
});

module.exports = ImportButton;
