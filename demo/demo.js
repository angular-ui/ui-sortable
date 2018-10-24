
var myapp = angular.module('sortableApp', ['ui.sortable']);

myapp.buildArray = function(name, size) {
  var i, array = [];
  for (i = 1; i <= size; i++){
    array.push({
      text: name + ' ' + i ,
      value: i
    });
  }

  return array;
};

myapp.controller('sortableController', function ($scope) {
  'use strict';

  $scope.list = myapp.buildArray('Item', 5);

  $scope.sortingLog = [];

  $scope.sortableOptions = {
    // called after a node is dropped
    stop: function(e, ui) {
      var logEntry = {
        ID: $scope.sortingLog.length + 1,
        Text: 'Moved element: ' + ui.item.scope().item.text
      };
      $scope.sortingLog.push(logEntry);
    }
  };
});

myapp.controller('connectedController', function ($scope) {
  $scope.leftArray = myapp.buildArray('Left', 5);
  $scope.rightArray = myapp.buildArray('Right', 7);
  $scope.sortableOptions = {
    connectWith: '.connectedItemsExample .list'
  };
});
