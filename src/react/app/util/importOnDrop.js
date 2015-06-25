function attachToNode(node, importFile, {dragOver, beforeDrop, afterDrop} = {}) {
  var ignoredDirectories = [".git", ".svn", "EIFGENs"];

  node.addEventListener('dragover', function (e) {
    e.preventDefault();
    dragOver && dragOver(e);
  });

  node.addEventListener('dragleave', function (e) {
    e.preventDefault();
    dragLeave && dragLeave(e);
  });

  node.addEventListener('drop', function (e) {
    beforeDrop && beforeDrop(e);
    e.preventDefault();

    var length = e.dataTransfer.items.length;

    for (var i = 0; i < length; i++) {
      var entries = [];
      entries[0] = e.dataTransfer.items[i].webkitGetAsEntry();
      readDirectory(entries, "");
    }

    afterDrop && afterDrop(e);
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
      importFile(path + file.name, e.target.result);
    };
    reader.readAsText(file);
  }


  function toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
  }

  function errorHandler(e) {
    console.log('FileSystem API error code: ' + e.code, e)
  }
}

module.exports = attachToNode;
