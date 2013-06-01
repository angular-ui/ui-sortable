/*
 * wrap jQuery UI Sortable Widget
 *
 * <tbody ui-sortable="myOptions">
 *    <tr ng-repeat="..."></tr>
 * </tbody>
 *
 * $scope.myOptions = {
 *     options: {
 *         //jQuery UI Sortable Widget Options, the same below. http://api.jqueryui.com/sortable/#option
 *     },
 *     events: // jQuery UI Sortable Widget Events, http://api.jqueryui.com/sortable/#event
 *     methods: // extend jQuery UI Sortable Widget Methods to AngularJS after initialize., http://api.jqueryui.com/sortable/#methods
 *              // then you can invoke methods like this: $scope.myOptions.methods.cancel();
 *     items: [] // ng-repeat items array reference, optional. Notice that items will be get asynchronous in most cases.
 * };
 *
 */

'use strict';
/*global angular, $*/

angular.module('ui.directives.sortable', []).value('uiSortableConfig', {}).directive('uiSortable', [
    'uiSortableConfig',
  function (uiSortableConfig) {
    var methodsName = ['cancel', 'destroy', 'disable', 'enable', 'option', 'refresh', 'refreshPositions', 'serialize', 'toArray', 'widget'],
      eventsName = ['sortactivate', 'sortbeforestop', 'sortchange', 'sortcreate', 'sortdeactivate', 'sortout', 'sortover', 'sortreceive', 'sortremove', 'sort', 'sortstart', 'sortstop', 'sortupdate'];
    return {
      link: function (scope, element, attr, ctrl) {
        var updateItems = {},
          sortable = scope.$eval(attr.uiSortable);

        sortable = angular.isObject(sortable) ? sortable : {};
        sortable.options = angular.isObject(sortable.options) ? sortable.options : {};
        sortable.methods = angular.isObject(sortable.methods) ? sortable.methods : {};
        sortable.events = angular.isObject(sortable.events) ? sortable.events : {};
        sortable.element = element;

        if (!sortable.options.appendTo) {
          sortable.options.appendTo = element.parents('.ng-view')[0] || element.parents('[ng-view]')[0] || 'parent';
        }

        if (angular.isArray(sortable.items)) {
          updateItems.sortstart = function (e, ui) {
            // Save index of dragged item
            ui.item.sortable = {
              index: ui.item.index()
            };
          };
          updateItems.sortreceive = function (e, ui) {
            // added item to array into correct position and set up flag
            ui.item.sortable.relocate = true;
            sortable.items.splice(ui.item.index(), 0, ui.item.sortable.moved);
          };
          updateItems.sortremove = function (e, ui) {
            // get item from items
            if (sortable.items.length === 1) {
              ui.item.sortable.moved = sortable.items.splice(0, 1)[0];
            } else {
              ui.item.sortable.moved = sortable.items.splice(ui.item.sortable.index, 1)[0];
            }
          };
          updateItems.sortupdate = function (e, ui) {
            if (!ui.item.sortable.relocate) {
              // Fetch saved and current position of dropped element
              var end, start;
              start = ui.item.sortable.index;
              end = ui.item.index();

              // Reorder array and apply change to scope
              sortable.items.splice(end, 0, sortable.items.splice(start, 1)[0]);
            }
            scope.$apply();
          };
        }

        // extend sortable methods to AngularJS
        angular.forEach(methodsName, function (name) {
          sortable.methods[name] = function () {
            var args = [name];
            angular.forEach(arguments, function (value) {
              args.push(value);
            });
            return element.sortable.apply(element, args);
          };
        });

        //autoupdate options
        scope.$watch(function () {
          return sortable.options;
        }, function (value) {
          element.sortable('option', value);
        });

        // update items and emit sortable events to AngularJS
        element.on(eventsName.join(' '), function (event, ui) {
          if (updateItems[event.type]) {
            updateItems[event.type](event, ui);
          }
          scope.$emit(event.type, ui);
        });

        element.sortable(angular.extend({}, uiSortableConfig, sortable.options, sortable.events));
        sortable.widget = element.sortable('widget');
      }
    };
  }
]);