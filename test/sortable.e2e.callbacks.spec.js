'use strict';

describe('uiSortable', function() {

  // Ensure the sortable angular module is loaded
  beforeEach(module('ui.sortable'));
  beforeEach(module('ui.sortable.testHelper'));

  var EXTRA_DY_PERCENTAGE, listContent, hasUndefinedProperties;

  beforeEach(inject(function (sortableTestHelper) {
    EXTRA_DY_PERCENTAGE = sortableTestHelper.EXTRA_DY_PERCENTAGE;
    listContent = sortableTestHelper.listContent;
    hasUndefinedProperties = sortableTestHelper.hasUndefinedProperties;
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
            helper: function (e, item) {
              return item;
            },
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

    it('should properly set ui.item.sortable properties', function() {
      inject(function($compile, $rootScope) {
        var element, updateCallbackExpectations;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            update: function(e, ui) {
              if (ui.item.scope().item === 'Two') {
                ui.item.sortable.cancel();
              }
              updateCallbackExpectations(ui.item.sortable);
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        $rootScope.$apply(function() {
        });
        var li = element.find(':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.model).toEqual('Two');
          expect(uiItemSortable.index).toEqual(1);
          expect(uiItemSortable.source.length).toEqual(1);
          expect(uiItemSortable.source[0]).toBe(host.children()[0]);
          expect(uiItemSortable.sourceModel).toBe($rootScope.items);
          expect(uiItemSortable.isCanceled()).toBe(true);
          expect(uiItemSortable.isCustomHelperUsed()).toBe(false);
        };
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));
        updateCallbackExpectations = undefined;

        li = element.find(':eq(0)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.model).toEqual('One');
          expect(uiItemSortable.index).toEqual(0);
          expect(uiItemSortable.source.length).toEqual(1);
          expect(uiItemSortable.source[0]).toBe(host.children()[0]);
          expect(uiItemSortable.sourceModel).toBe($rootScope.items);
          expect(uiItemSortable.isCanceled()).toBe(false);
          expect(uiItemSortable.isCustomHelperUsed()).toBe(false);
        };
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));
        updateCallbackExpectations = undefined;

        li = element.find(':eq(2)');
        dy = -(2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.model).toEqual('One');
          expect(uiItemSortable.index).toEqual(2);
          expect(uiItemSortable.source.length).toEqual(1);
          expect(uiItemSortable.source[0]).toBe(host.children()[0]);
          expect(uiItemSortable.sourceModel).toBe($rootScope.items);
          expect(uiItemSortable.isCanceled()).toBe(false);
          expect(uiItemSortable.isCustomHelperUsed()).toBe(false);
        };
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));
        updateCallbackExpectations = undefined;

        $(element).remove();
      });
    });

    it('should properly free ui.item.sortable object', function() {
      inject(function($compile, $rootScope) {
        var element, uiItem, uiItemSortable_Destroy;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            start: function (e, ui) {
              uiItem = ui.item;
              spyOn(ui.item.sortable, '_destroy').andCallThrough();
              uiItemSortable_Destroy = ui.item.sortable._destroy;
            },
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
        expect(uiItemSortable_Destroy).toHaveBeenCalled();
        expect(hasUndefinedProperties(uiItem.sortable)).toBe(true);
        uiItem = uiItemSortable_Destroy = undefined;


        li = element.find(':eq(0)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));
        expect(uiItemSortable_Destroy).toHaveBeenCalled();
        expect(hasUndefinedProperties(uiItem.sortable)).toBe(true);
        uiItem = uiItemSortable_Destroy = undefined;


        li = element.find(':eq(2)');
        dy = -(2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));
        expect(uiItemSortable_Destroy).toHaveBeenCalled();
        expect(hasUndefinedProperties(uiItem.sortable)).toBe(true);
        uiItem = uiItemSortable_Destroy = undefined;

        $(element).remove();
      });
    });

  });

});