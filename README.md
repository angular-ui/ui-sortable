# ui-sortable directive [![Build Status](https://travis-ci.org/angular-ui/ui-sortable.png)](https://travis-ci.org/angular-ui/ui-sortable)

This directive allows you to sort array with drag & drop.

## Requirements

- JQuery
- JQueryUI

## Usage

Load the script file: sortable.js in your application:

    <script type="text/javascript" src="modules/directives/sortable/src/sortable.js"></script>

Apply the directive to your form elements:

    <ul ui-sortable="mySortable">
        <li ng-repeat="item in items">{{ item }}</li>
    </ul>

Add the sortable module as a dependency to your application module:

    var myAppModule = angular.module('MyApp', ['ui.directives.sortable'])


### Options

All the jQueryUI Sortable options, methods, events can be passed into `mySortable`.

    myAppModule.controller('MyController', function($scope) {
      $scope.items = ["One", "Two", "Three"];

      $scope.mySortable = {
          options: {
              axis: 'x'
              },
          items: $scope.items,
          events: {
              update: function(e, ui) { ... }
          }
      }
    });

