'use strict';

describe('uiSortable', function() {

  // Ensure the sortable angular module is loaded
  beforeEach(module('ui.sortable'));
  beforeEach(module('ui.sortable.testHelper'));

  var EXTRA_DY_PERCENTAGE, listContent;

  beforeEach(inject(function (sortableTestHelper) {
    EXTRA_DY_PERCENTAGE = sortableTestHelper.EXTRA_DY_PERCENTAGE;
    listContent = sortableTestHelper.listContent;
  }));

  describe('Callbacks related', function() {

    var host;

    beforeEach(inject(function() {
      host = $('<div id="test-host"></div>');
      $('body').append(host);
    }));

    afterEach(function() {
      host.remove();
      host = null;
    });

    it('should cancel sorting of node "Two"', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            update: function(e, ui) {
              if (ui.item.scope().item === 'Two') {
                ui.item.sortable.cancel();
              }
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find(':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(0)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(2)');
        dy = -(2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        $(element).remove();
      });
    });

    it('should cancel sorting of node "Two" and "helper: function" that returns a list element is used', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            update: function(e, ui) {
              if (ui.item.scope().item === 'Two') {
                ui.item.sortable.cancel();
              }
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find(':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(0)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(2)');
        dy = -(2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        $(element).remove();
      });
    });

    it('should update model from update() callback', function() {
      inject(function($compile, $rootScope) {
        var element, logsElement;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        logsElement = $compile('<ul ng-model="logs"><li ng-repeat="log in logs" id="l-{{$index}}">{{ log }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            update: function(e, ui) {
              $rootScope.logs.push('Moved element ' + ui.item.scope().item);
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
          $rootScope.logs = [];
        });

        host.append(element).append(logsElement);

        var li = element.find(':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.logs).toEqual(['Moved element Two']);
        expect($rootScope.items).toEqual(listContent(element));
        expect($rootScope.logs).toEqual(listContent(logsElement));

        $(element).remove();
        $(logsElement).remove();
      });
    });

    // ensure scope.apply() is called after a stop() callback
    it('should update model from stop() callback', function() {
      inject(function($compile, $rootScope) {
        var element, logsElement;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        logsElement = $compile('<ul ng-model="logs"><li ng-repeat="log in logs" id="l-{{$index}}">{{ log }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            stop: function(e, ui) {
              $rootScope.logs.push('Moved element ' + ui.item.scope().item);
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
          $rootScope.logs = [];
        });

        host.append(element).append(logsElement);

        var li = element.find(':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.logs).toEqual(['Moved element Two']);
        expect($rootScope.items).toEqual(listContent(element));
        expect($rootScope.logs).toEqual(listContent(logsElement));

        $(element).remove();
        $(logsElement).remove();
      });
    });

    it('should call the create() callback when initialized', function() {
      inject(function($compile, $rootScope) {
        var element;
        $rootScope.$apply(function() {
          $rootScope.items = ['One', 'Two', 'Three'];
          $rootScope.opts = {
            create: function() {

            }
          };
          spyOn($rootScope.opts, 'create');
          element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        });

        host.append(element);

        expect($rootScope.opts.create).toHaveBeenCalled();

        $(element).remove();
      });
    });

  });

});