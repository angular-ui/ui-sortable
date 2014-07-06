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
        dy: dropTarget.position().top - draggedElement.position().top
      };

      if (options === 'above') {
        dragOptions.dy -= EXTRA_DY_PERCENTAGE * draggedElement.outerHeight();
      } else if (options === 'below') {
        dragOptions.dy += EXTRA_DY_PERCENTAGE * draggedElement.outerHeight();
      } else if (typeof options === 'object') {
        
        if (isFinite(options.dy)) {
          dragOptions.dy += options.dy;
        }

        if (isFinite(options.dx)) {
          dragOptions.dx += options.dx;
        }
      }

      draggedElement.simulate('drag', dragOptions);
    }

    return {
      EXTRA_DY_PERCENTAGE: EXTRA_DY_PERCENTAGE,
      listContent: listContent,
      listInnerContent: listInnerContent,
      simulateElementDrag: simulateElementDrag
    };
  });
