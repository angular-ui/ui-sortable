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

  tests.description = 'Attribute Callbacks related';
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
          '<ul ui-sortable ui-sortable-update="update" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.update = function(e, ui) {
            if (ui.item.sortable.model === 'Two') {
              ui.item.sortable.cancel();
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
        // try again
        li = element.find('[ng-repeat]:eq(1)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));
        // try again
        li = element.find('[ng-repeat]:eq(1)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
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

    it('should call all callbacks with the proper context', function() {
      inject(function($compile, $rootScope) {
        var element, callbackContexts = {};
        $rootScope.$apply(function() {
          $rootScope.create = function() {
            callbackContexts.create = this;
          };
          // $rootScope.helper = function(e, item) {
          //   callbackContexts.helper = this;
          //   return item;
          // };
          $rootScope.start = function() {
            callbackContexts.start = this;
          };
          $rootScope.activate = function() {
            callbackContexts.activate = this;
          };
          $rootScope.beforeStop = function() {
            callbackContexts.beforeStop = this;
          };
          $rootScope.update = function() {
            callbackContexts.update = this;
          };
          $rootScope.deactivate = function() {
            callbackContexts.deactivate = this;
          };
          $rootScope.stop = function() {
            callbackContexts.stop = this;
          };

          // spyOn($rootScope, 'helper').and.callThrough();
          spyOn($rootScope, 'create').and.callThrough();
          spyOn($rootScope, 'start').and.callThrough();
          spyOn($rootScope, 'activate').and.callThrough();
          spyOn($rootScope, 'beforeStop').and.callThrough();
          spyOn($rootScope, 'update').and.callThrough();
          spyOn($rootScope, 'deactivate').and.callThrough();
          spyOn($rootScope, 'stop').and.callThrough();
          $rootScope.items = ['One', 'Two', 'Three'];
          element = $compile(''.concat(
            '<ul ui-sortable ' +
            'ui-sortable-create="create" ' +
            // 'ui-sortable-helper="helper" ' +
            'ui-sortable-start="start" ' +
            'ui-sortable-activate="activate" ' +
            'ui-sortable-update="update" ' +
            'ui-sortable-before-stop="beforeStop" ' +
            'ui-sortable-deactivate="deactivate" ' +
            'ui-sortable-stop="stop" ' +
            'ng-model="items">',
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

        expect($rootScope.create).toHaveBeenCalled();
        // expect($rootScope.helper).toHaveBeenCalled();
        expect($rootScope.start).toHaveBeenCalled();
        expect($rootScope.activate).toHaveBeenCalled();
        expect($rootScope.beforeStop).toHaveBeenCalled();
        expect($rootScope.update).toHaveBeenCalled();
        expect($rootScope.deactivate).toHaveBeenCalled();
        expect($rootScope.stop).toHaveBeenCalled();

        expect(callbackContexts.create).toEqual(element[0]);
        // expect(callbackContexts.helper).toEqual(element[0]);
        expect(callbackContexts.start).toEqual(element[0]);
        expect(callbackContexts.activate).toEqual(element[0]);
        expect(callbackContexts.beforeStop).toEqual(element[0]);
        expect(callbackContexts.update).toEqual(element[0]);
        expect(callbackContexts.deactivate).toEqual(element[0]);
        expect(callbackContexts.stop).toEqual(element[0]);

        $(element).remove();
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