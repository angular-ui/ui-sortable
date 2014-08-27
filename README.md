# UI.Sortable directive [![Build Status](https://travis-ci.org/angular-ui/ui-sortable.svg)](https://travis-ci.org/angular-ui/ui-sortable) [![Coverage Status](https://coveralls.io/repos/angular-ui/ui-sortable/badge.png?branch=master)](https://coveralls.io/r/angular-ui/ui-sortable?branch=master)

This directive allows you to sort an array with drag & drop.

## Requirements

- JQuery
- JQueryUI 1.9+
- AngularJS

[Single minified cdn link](http://cdn.jsdelivr.net/g/jquery@1,jquery.ui@1.10%28jquery.ui.core.min.js+jquery.ui.widget.min.js+jquery.ui.mouse.min.js+jquery.ui.sortable.min.js%29,angularjs@1.2,angular.ui-sortable) ~245kB and [example](http://codepen.io/thgreasi/pen/olDJi) with JQuery v1.x, required parts of JQueryUI v1.10, AngularJS v1.2 & latest angular-ui-sortable.

**Notes:**
> * JQuery must be included before AngularJS.  
> * JQueryUI dependecies include [core](http://api.jqueryui.com/category/ui-core/), [widget](http://api.jqueryui.com/jQuery.widget/), [mouse](http://api.jqueryui.com/mouse/) & [sortable](http://api.jqueryui.com/sortable/). Creating a [custom build](http://jqueryui.com/download/#!version=1.10&components=1110000010000000000000000000000000) will [greatly reduce](https://github.com/angular-ui/ui-sortable/issues/154#issuecomment-40279430) the required file size. ([CDN](http://www.jsdelivr.com/) links for comparison: [full](http://cdn.jsdelivr.net/g/jquery.ui@1.10) vs  [minimal](http://cdn.jsdelivr.net/g/jquery.ui@1.10%28jquery.ui.core.min.js+jquery.ui.widget.min.js+jquery.ui.mouse.min.js+jquery.ui.sortable.min.js%29))

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

**Developing Notes:**

* `ng-model` is required, so that the directive knows which model to update.
* `ui-sortable` element should only contain one `ng-repeat` and not any other elements (above or below).  
  Otherwise the index matching of the generated DOM elements and the `ng-model`'s items will break.  
  **In other words: The items of `ng-model` must match the indexes of the generated DOM elements.**
* `ui-sortable` lists containing many 'types' of items can be implemented by using dynamic template loading [with ng-include](http://stackoverflow.com/questions/14607879/angularjs-load-dynamic-template-html-within-directive/14621927#14621927) or a [loader directive](https://gist.github.com/thgreasi/7152499c0e91973c4820), to determine how each model item should be rendered. Also take a look at the [Tree with dynamic template](http://codepen.io/thgreasi/pen/uyHFC) example.

### Options

All the [jQueryUI Sortable options](http://api.jqueryui.com/sortable/) can be passed through the directive.


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

When using event callbacks ([start](http://api.jqueryui.com/sortable/#event-start)/[update](http://api.jqueryui.com/sortable/#event-update)/[stop](http://api.jqueryui.com/sortable/#event-stop)...), avoid manipulating DOM elements (especially the one with the ng-repeat attached).
The suggested pattern is to use callbacks for emmiting events and altering the scope (inside the 'Angular world').

#### Canceling

Inside the `update` callback, you can check the item that is dragged and cancel the sorting.

```js
$scope.sortableOptions = {
  update: function(e, ui) {
    if (ui.item.scope().item == "can't be moved") {
      ui.item.sortable.cancel();
    }
  }
};
```

**Notes:**
* `update` is the appropriate place to cancel a sorting, since it occurs before any model/scope changes but after the DOM position has been updated.
So `ui.item.scope` and the directive's `ng-model`, are equal to the scope before the drag start.
* To [cancel a sorting between connected lists](https://github.com/angular-ui/ui-sortable/issues/107#issuecomment-33633638), `cancel` should be called inside the `update` callback of the originating list.

### jQueryUI Sortable Event order

**Single sortable** [demo](http://codepen.io/thgreasi/pen/KtsFH)
```
start
activate

/* multiple: sort/change/over/out */

beforeStop
update    <= call cancel() here if needed
deactivate
stop
```

**Connected sortables** [demo](http://codepen.io/thgreasi/pen/uIBKb)

```
list A: start
list B: activate
list A: activate

/* both lists multiple: sort/change/over/out */
list A: sort
list A: change
list B: change
list B: over
list A: sort
list B: out
list A: sort

list A: beforeStop
list A: update    <= call cancel() here if needed
list A: remove
list B: receive
list B: update
list B: deactivate
list A: deactivate
list A: stop
```

For more details about the events check the [jQueryUI API documentation](http://api.jqueryui.com/sortable/).

## Examples

- [Simple Demo](http://codepen.io/thgreasi/pen/jlkhr)
- [Connected Lists](http://codepen.io/thgreasi/pen/uFile)
- [Filtering](http://codepen.io/thgreasi/pen/mzGbq) ([details](https://github.com/angular-ui/ui-sortable/issues/113))
- [Ordering 1](http://codepen.io/thgreasi/pen/iKEHd) & [Ordering 2](http://plnkr.co/edit/XPUzJjdvwE0QWQ6py6mQ?p=preview) ([details](https://github.com/angular-ui/ui-sortable/issues/70))
- [Cloning](http://codepen.io/thgreasi/pen/qmvhG) ([details](https://github.com/angular-ui/ui-sortable/issues/139))
- [Tree with dynamic template](http://codepen.io/thgreasi/pen/uyHFC)
- Canceling
  - [Connected Lists With Max Size](http://codepen.io/thgreasi/pen/IdvFc)
  - [Connected Lists Without Duplicates](http://codepen.io/thgreasi/pen/uKfyt)

## Reporting Issues

The [above](#examples) pen's are provided as a good starting point to demonstrate issues, proposals and use cases.
Feel free to edit any of them for your needs (don't forget to also update the libraries used to your version).

## Testing

We use Karma and jshint to ensure the quality of the code.  The easiest way to run these checks is to use grunt:

```sh
npm install -g grunt-cli
npm install && bower install
grunt
```

The karma task will try to open Firefox and Chrome as browser in which to run the tests.  Make sure this is available or change the configuration in `test\karma.conf.js`


### Grunt Serve

We have one task to serve them all !

```sh
grunt serve
```

It's equal to run separately:

* `grunt connect:server` : giving you a development server at [http://127.0.0.1:8000/](http://127.0.0.1:8000/).

* `grunt karma:server` : giving you a Karma server to run tests (at [http://localhost:9876/](http://localhost:9876/) by default). You can force a test on this server with `grunt karma:unit:run`.

* `grunt watch` : will automatically test your code and build your demo.  You can demo generation with `grunt build:gh-pages`.
