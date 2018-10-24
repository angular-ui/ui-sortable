/* jshint node:true */

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function() {
  var wiredep = require('wiredep');

  var bower_dependencies = wiredep({ cwd: __dirname });

  var js_dependencies = []
    .concat(bower_dependencies.packages['jquery'].main)
    .concat(bower_dependencies.packages['jquery-ui'].main)
    .map(function(p) {
      return p.replace(path.join(__dirname, '/'), '');
    });

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
    js : function(defaultJsFiles){
      // HACK TO LOAD JQUERY BEFORE ANGULAR
      return ['vendor/jquery.js'].concat(defaultJsFiles, js_dependencies.slice(1).map(putThemInVendorDir).concat(['dist/sortable.js']));
    },
    bowerData: { main : './sortable.js' },
    tocopy : css_dependencies.concat(js_dependencies)
  };
};
