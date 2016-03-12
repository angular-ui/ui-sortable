'use strict';

describe('uiSortable', function() {

  beforeEach(module(function($compileProvider) {
    if (typeof $compileProvider.debugInfoEnabled === 'function') {
      $compileProvider.debugInfoEnabled(false);
    }
  }));

  // Ensure the sortable angular module is loaded
  beforeEach(module('ui.sortable'));
  beforeEach(module('ui.sortable.testHelper'));

  var EXTRA_DY_PERCENTAGE, listContent, hasUndefinedProperties, beforeLiElement, afterLiElement;

  beforeEach(inject(function (sortableTestHelper) {
    EXTRA_DY_PERCENTAGE = sortableTestHelper.EXTRA_DY_PERCENTAGE;
    listContent = sortableTestHelper.listContent;
    hasUndefinedProperties = sortableTestHelper.hasUndefinedProperties;
    beforeLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.beforeLiElement;
    afterLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.afterLiElement;
  }));

  tests.description = 'Callbacks related';
  function tests (useExtraElements) {

    var host;

    beforeEach(inject(function() {
      host = $('<div id="test-host"></div>');
      $('body').append(host);

      if (!useExtraElements) {
        beforeLiElement = afterLiElement = '';
      }
    }));

    afterEach(function() {
      host.remove();
      host = null;
    });

    it('should cancel sorting of node "Two"', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            update: function(e, ui) {
              if (ui.item.sortable.model === 'Two') {
                ui.item.sortable.cancel();
              }
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find('[ng-repeat]:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(0)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(2)');
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
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
          afterLiElement +
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            helper: function (e, item) {
              return item;
            },
            update: function(e, ui) {
              if (ui.item.sortable.model === 'Two') {
                ui.item.sortable.cancel();
              }
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find('[ng-repeat]:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(0)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(2)');
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
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
          afterLiElement +
          '</ul>'))($rootScope);
        logsElement = $compile(''.concat(
          '<ul ng-model="logs">',
          beforeLiElement,
          '<li ng-repeat="log in logs" id="l-{{$index}}">{{ log }}</li>',
          afterLiElement +
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            update: function(e, ui) {
              $rootScope.logs.push('Moved element ' + ui.item.sortable.model);
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
          $rootScope.logs = [];
        });

        host.append(element).append(logsElement);

        var li = element.find('[ng-repeat]:eq(1)');
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
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
          afterLiElement +
          '</ul>'))($rootScope);
        logsElement = $compile(''.concat(
          '<ul ng-model="logs">',
          beforeLiElement,
          '<li ng-repeat="log in logs" id="l-{{$index}}">{{ log }}</li>',
          afterLiElement +
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            stop: function(e, ui) {
              $rootScope.logs.push('Moved element ' + ui.item.sortable.model);
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
          $rootScope.logs = [];
        });

        host.append(element).append(logsElement);

        var li = element.find('[ng-repeat]:eq(1)');
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
          element = $compile(''.concat(
            '<ul ui-sortable="opts" ng-model="items">',
            beforeLiElement,
            '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
            afterLiElement +
            '</ul>'))($rootScope);
        });

        host.append(element);

        expect($rootScope.opts.create).toHaveBeenCalled();

        $(element).remove();
      });
    });

    it('should properly set ui.item.sortable properties', function() {
      inject(function($compile, $rootScope) {
        var element, updateCallbackExpectations;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
          afterLiElement +
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            update: function(e, ui) {
              if (ui.item.sortable.model === 'Two') {
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
        var li = element.find('[ng-repeat]:eq(1)');
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

        li = element.find('[ng-repeat]:eq(0)');
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

        li = element.find('[ng-repeat]:eq(2)');
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

    it('should call all callbacks with the proper context', function() {
      inject(function($compile, $rootScope) {
        var element, callbackContexts = {};
        $rootScope.$apply(function() {
          $rootScope.opts = {
            helper: function(e, item) {
              callbackContexts.helper = this;
              return item;
            },
            create: function() {
              callbackContexts.create = this;
            },
            start: function() {
              callbackContexts.start = this;
            },
            activate: function() {
              callbackContexts.activate = this;
            },
            beforeStop: function() {
              callbackContexts.beforeStop = this;
            },
            update: function() {
              callbackContexts.update = this;
            },
            deactivate: function() {
              callbackContexts.deactivate = this;
            },
            stop: function() {
              callbackContexts.stop = this;
            }
          };
          spyOn($rootScope.opts, 'helper').and.callThrough();
          spyOn($rootScope.opts, 'create').and.callThrough();
          spyOn($rootScope.opts, 'start').and.callThrough();
          spyOn($rootScope.opts, 'activate').and.callThrough();
          spyOn($rootScope.opts, 'beforeStop').and.callThrough();
          spyOn($rootScope.opts, 'update').and.callThrough();
          spyOn($rootScope.opts, 'deactivate').and.callThrough();
          spyOn($rootScope.opts, 'stop').and.callThrough();
          $rootScope.items = ['One', 'Two', 'Three'];
          element = $compile(''.concat(
            '<ul ui-sortable="opts" ng-model="items">',
            beforeLiElement,
            '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
            afterLiElement +
            '</ul>'))($rootScope);
        });

        host.append(element);

        $rootScope.$apply(function() {
        });
        var li = element.find('[ng-repeat]:eq(0)');
        var dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        expect($rootScope.opts.helper).toHaveBeenCalled();
        expect($rootScope.opts.create).toHaveBeenCalled();
        expect($rootScope.opts.start).toHaveBeenCalled();
        expect($rootScope.opts.activate).toHaveBeenCalled();
        expect($rootScope.opts.beforeStop).toHaveBeenCalled();
        expect($rootScope.opts.update).toHaveBeenCalled();
        expect($rootScope.opts.deactivate).toHaveBeenCalled();
        expect($rootScope.opts.stop).toHaveBeenCalled();

        expect(callbackContexts.helper).toEqual(element[0]);
        expect(callbackContexts.create).toEqual(element[0]);
        expect(callbackContexts.start).toEqual(element[0]);
        expect(callbackContexts.activate).toEqual(element[0]);
        expect(callbackContexts.beforeStop).toEqual(element[0]);
        expect(callbackContexts.update).toEqual(element[0]);
        expect(callbackContexts.deactivate).toEqual(element[0]);
        expect(callbackContexts.stop).toEqual(element[0]);

        $(element).remove();
      });
    });

    it('should properly free ui.item.sortable object', function() {
      inject(function($compile, $rootScope) {
        var element, uiItem, uiItemSortable_Destroy;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
          afterLiElement +
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            start: function (e, ui) {
              uiItem = ui.item;
              spyOn(ui.item.sortable, '_destroy').and.callThrough();
              uiItemSortable_Destroy = ui.item.sortable._destroy;
            },
            update: function(e, ui) {
              if (ui.item.sortable.model === 'Two') {
                ui.item.sortable.cancel();
              }
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find('[ng-repeat]:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));
        expect(uiItemSortable_Destroy).toHaveBeenCalled();
        expect(hasUndefinedProperties(uiItem.sortable)).toBe(true);
        uiItem = uiItemSortable_Destroy = undefined;


        li = element.find('[ng-repeat]:eq(0)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));
        expect(uiItemSortable_Destroy).toHaveBeenCalled();
        expect(hasUndefinedProperties(uiItem.sortable)).toBe(true);
        uiItem = uiItemSortable_Destroy = undefined;


        li = element.find('[ng-repeat]:eq(2)');
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

    it('should properly reset a deleted callback option', function() {
      inject(function($compile, $rootScope) {
        var element, logsElement;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
          afterLiElement +
          '</ul>'))($rootScope);
        logsElement = $compile(''.concat(
          '<ul ng-model="logs">',
          beforeLiElement,
          '<li ng-repeat="log in logs" id="l-{{$index}}">{{ log }}</li>',
          afterLiElement +
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            stop: function(e, ui) {
              $rootScope.logs.push('Moved element ' + ui.item.sortable.model);
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
          $rootScope.logs = [];
        });

        host.append(element).append(logsElement);

        var li = element.find('[ng-repeat]:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.logs).toEqual(['Moved element Two']);
        expect($rootScope.items).toEqual(listContent(element));
        expect($rootScope.logs).toEqual(listContent(logsElement));

        $rootScope.$digest();
          
        $rootScope.$apply(function() {
          $rootScope.opts = {};
        });

        li = element.find('[ng-repeat]:eq(0)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqual(listContent(element));
        // the log should be the same
        expect($rootScope.logs).toEqual(['Moved element Two']);
        expect($rootScope.logs).toEqual(listContent(logsElement));

        $(element).remove();
        $(logsElement).remove();
      });
    });

  }

  [0, 1].forEach(function(useExtraElements){
    var testDescription = tests.description;

    if (useExtraElements) {
      testDescription += ' with extra elements';
    }

    describe(testDescription, function(){
      tests(useExtraElements);
    });
  });

});