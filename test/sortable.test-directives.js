'use strict';

angular.module('ui.sortable.testDirectives', [])
  .directive('uiSortableSimpleTestDirective',
    function() {
      return {
        restrict: 'AE',
        scope: true,
        require: '?ngModel',
        template: '<div>Directive: <span class="itemContent" ng-bind="text"></span> !!!</div>',
        link: function(scope, element, attrs) {
          scope.$watch(attrs.ngModel, function(value) {
            scope.text = value;
          });
        }
      };
    }
  )
  .directive('uiSortableDestroyableTestDirective',
    function() {
      return {
        restrict: 'AE',
        scope: true,
        require: '?ngModel',
        template: '<div>$destroy(able) Directive: <span class="itemContent" ng-bind="text"></span> !!!</div>',
        link: function(scope, element, attrs) {
          scope.$watch(attrs.ngModel, function(value) {
            scope.text = value;
          });

          element.bind('$destroy', function() {
            element.html('');
          });
        }
      };
    }
  ).directive('uiSortableTransclusionTestDirective',
    function() {
      return {
        restrict: 'E',
        transclude: true,
        scope: true,
        template: '<div>' +
                    '<h1>Transclusion Directive</h1>' +
                    '<div>' +
                      '<div>' +
                        '<ng-transclude></ng-transclude>' +
                      '</div>' +
                    '</div>' +
                  '</div>'
      };
    }
  );

