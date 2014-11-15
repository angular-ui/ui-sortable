'use strict';

angular.module('ui.sortable.testHelper', [])
  .factory('sortableTestHelper', function () {
    var EXTRA_DY_PERCENTAGE = 0.25;

    function listContent (list) {
      if (list && list.length) {
        return list.children().map(function(){ return this.innerHTML; }).toArray();
      }
      return [];
    }

    function listInnerContent (list, contentSelector) {
      if (!contentSelector) {
        contentSelector = '.itemContent';
      }

      if (list && list.length) {
        return list.children().map(function(){ return $(this).find(contentSelector).html(); }).toArray();
      }
      return [];
    }

    function simulateElementDrag(draggedElement, dropTarget, options) {
      var dragOptions = {
        dx: dropTarget.position().left - draggedElement.position().left,
        dy: dropTarget.position().top - draggedElement.position().top,
        moves: 30
      };

      if (options === 'above') {
        dragOptions.dy -= EXTRA_DY_PERCENTAGE * draggedElement.outerHeight();
      } else if (options === 'below') {
        dragOptions.dy += EXTRA_DY_PERCENTAGE * draggedElement.outerHeight();
      } else if (typeof options === 'object') {

        if ('place' in options) {
          if (options.place === 'above') {
            dragOptions.dy -= EXTRA_DY_PERCENTAGE * draggedElement.outerHeight();
          } else if (options.place === 'below') {
            dragOptions.dy += EXTRA_DY_PERCENTAGE * draggedElement.outerHeight();
          }
        }

        if (isFinite(options.dx)) {
          dragOptions.dx = options.dx;
        }
        if (isFinite(options.dy)) {
          dragOptions.dy = options.dy;
        }
        
        if (isFinite(options.extrady)) {
          dragOptions.dy += options.extrady;
        }

        if (isFinite(options.extradx)) {
          dragOptions.dx += options.extradx;
        }
      }

      draggedElement.simulate('drag', dragOptions);
    }

    function hasUndefinedProperties(testObject) {
      return testObject && Object.keys(testObject)
        .filter(function(key) {
          return testObject.hasOwnProperty(key) &&
                 testObject[key] !== undefined;
        })
        .length === 0;
    }

    return {
      EXTRA_DY_PERCENTAGE: EXTRA_DY_PERCENTAGE,
      listContent: listContent,
      listInnerContent: listInnerContent,
      simulateElementDrag: simulateElementDrag,
      hasUndefinedProperties: hasUndefinedProperties
    };
  })
  .controller('dummyController', function ($scope) {
    $scope.testItems = ['One', 'Two', 'Three'];
  });
