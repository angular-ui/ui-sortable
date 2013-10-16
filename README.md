# ui-sortable directive [![Build Status](https://travis-ci.org/angular-ui/ui-sortable.png)](https://travis-ci.org/angular-ui/ui-sortable)

This directive allows you to sort array with drag & drop.

## Requirements

- JQuery
- JQueryUI

## Usage

Load the script file: sortable.js in your application:

```html
<script type="text/javascript" src="modules/directives/sortable/src/sortable.js"></script>
```

Add the sortable module as a dependency to your application module:

```js
var myAppModule = angular.module('MyApp', ['ui.sortable'])
```

Apply the directive to your form elements:

```html
<ul ui-sortable ng-model="items">
  <li ng-repeat="item in items">{{ item }}</li>
</ul>
```

**Note:** `ng-model` is required, so that the directive knows which model to update.

### Options

All the jQueryUI Sortable options can be passed through the directive.


```js
myAppModule.controller('MyController', function($scope) {
  $scope.items = ["One", "Two", "Three"];

  $scope.sortableOptions = {
    update: function(e, ui) { ... },
    axis: 'x'
  };
});
```

```html
<ul ui-sortable="sortableOptions" ng-model="items">
  <li ng-repeat="item in items">{{ item }}</li>
</ul>
```

#### Canceling

Inside the `update` callback, you can check the item that is dragged and cancel the sorting.

```js
$scope.sortableOptions = {
  update: function(e, ui) {
    if (ui.item.scope().item == "can't be moved") {
      ui.item.parent().sortable('cancel');
    }
  }
};
```

**Note:** `update` occurs before any model/scope changes but after the DOM position has been updated.
So `ui.item.scope` and the directive's `ng-model`, are equal to the scope before the drag start.

#### Floating

To have a smooth horizontal-list reordering, jquery.ui.sortable needs to detect the orientation of the list.
This detection takes place during the initialization of the plugin (and some of the checks include: whether the first item is floating left/right or if 'axis' parameter is 'x', etc).
There is also a [known issue](bugs.jqueryui.com/ticket/7498) about initially empty horizontal lists.

To provide a solution/workaround (till jquery.ui.sortable.refresh() also tests the orientation or a more appropriate method is provided), ui-sortable directive provides a `floating` option as an extra to the [jquery.ui.sortable options](http://api.jqueryui.com/sortable/).

```html
<ul ui-sortable="{ floating: true }" ng-model="items">
  <li ng-repeat="item in items">{{ item }}</li>
</ul>
```

**OR**

```js
$scope.sortableOptions = {
  floating: true
};
```
```html
<ul ui-sortable="sortableOptions" ng-model="items">
  <li ng-repeat="item in items">{{ item }}</li>
</ul>
```


**floating** (default: undefined)  
Type: [Boolean](http://api.jquery.com/Types/#Boolean)/`undefined`
*   **undefined** Relies on jquery.ui to detect the list's orientation.
*   **false**     Forces jquery.ui.sortable to detect the list as vertical.
*   **true**      Forces jquery.ui.sortable to detect the list as horizontal.
