/* jshint node:true */

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function() {

  var js_dependencies =[
    'bower_components/jquery-ui/ui/jquery-ui.js'
  ];

  var css_dependencies = [
    'bower_components/jquery-ui/themes/smoothness/jquery-ui.css'
  ];

  function putThemInVendorDir (filepath) {
    return 'vendor/' + path.basename(filepath);
  }

  return {
    humaName : 'UI.Sortable',
    repoName : 'ui-sortable',
    inlineHTML : fs.readFileSync(__dirname + '/demo/demo.html'),
    inlineJS : fs.readFileSync(__dirname + '/demo/demo.js'),
    css: css_dependencies.map(putThemInVendorDir).concat(['demo/demo.css']),
    js : js_dependencies.map(putThemInVendorDir).concat(['dist/sortable.js']),
    tocopy : css_dependencies.concat(js_dependencies)
  };
};
