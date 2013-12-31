'use strict';

var myapp = angular.module('sortableApp', ['ui.sortable']);

myapp.controller('sortableController', function ($scope) {
  var tmpList = [];

  for (var i = 1; i <= 6; i++){
    tmpList.push({
      text: 'Item ' + i,
      value: i
    });
  }

  $scope.list = tmpList;


  $scope.sortingLog = [];

  $scope.sortableOptions = {
    // called after a node is dropped
    stop: function(e, ui) {
      var localScope = angular.element(ui.item).scope();
      var logEntry = {
        ID: $scope.sortingLog.length + 1,
        Text: 'Moved element: ' + localScope.item.text
      };
      $scope.sortingLog.push(logEntry);
    }
  };
});