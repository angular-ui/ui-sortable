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

  var EXTRA_DY_PERCENTAGE, listContent, simulateElementDrag, hasUndefinedProperties, beforeLiElement, afterLiElement;

  beforeEach(inject(function (sortableTestHelper) {
    EXTRA_DY_PERCENTAGE = sortableTestHelper.EXTRA_DY_PERCENTAGE;
    listContent = sortableTestHelper.listContent;
    simulateElementDrag = sortableTestHelper.simulateElementDrag;
    hasUndefinedProperties = sortableTestHelper.hasUndefinedProperties;
    beforeLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.beforeLiElement;
    afterLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.afterLiElement;
  }));

  tests.description = 'Events related';
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

    it('should emit an event after sorting', function() {
      inject(function($compile, $rootScope) {
        var element, uiParam, emittedUiParam;
        element = $compile(''.concat(
          '<ul ui-sortable ui-sortable-update="update" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.items = ['One', 'Two', 'Three'];
          $rootScope.update = function (e, ui) {
            uiParam = ui;
          };
          $rootScope.onSorting = function (e, ui) {
            emittedUiParam = ui;
          };
          spyOn($rootScope, 'onSorting').and.callThrough();

          $rootScope.$on('ui-sortable:moved', $rootScope.onSorting);
        });

        host.append(element);

        var li = element.find('[ng-repeat]:eq(0)');
        var dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        expect($rootScope.onSorting).toHaveBeenCalled();
        expect(uiParam).toEqual(emittedUiParam);

        $(element).remove();
      });
    });

    it('should emit an event after sorting between sortables of different scopes', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom,
            wrapperTop, wrapperBottom,
            wrapperTopScope, wrapperBottomScope,
            itemsTop, itemsBottom;
        wrapperTopScope = $rootScope.$new();
        wrapperBottomScope = $rootScope.$new();
        wrapperTop = $compile(''.concat(
          '<div ng-controller="dummyController"><ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul></div>'))(wrapperTopScope);
        wrapperBottom = $compile(''.concat(
          '<div ng-controller="dummyController"><ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul></div>'))(wrapperBottomScope);

        host.append(wrapperTop).append(wrapperBottom).append('<div class="clear"></div>');
        $rootScope.$apply(function() {
          wrapperTopScope.itemsTop = itemsTop = ['Top One', 'Top Two', 'Top Three'];
          wrapperTopScope.opts = {
            connectWith: '.cross-sortable',
            stop: function (e, ui) {
              wrapperTopScope.uiParam = ui;
            }
          };
          wrapperTopScope.onSorting = function (e, ui) {
            wrapperTopScope.emittedUiParam = ui;
          };
          spyOn(wrapperTopScope, 'onSorting').and.callThrough();
          $rootScope.$on('ui-sortable:moved', wrapperTopScope.onSorting);

          wrapperBottomScope.itemsBottom = itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          wrapperBottomScope.opts = {
            connectWith: '.cross-sortable',
            update: function (e, ui) {
              wrapperBottomScope.uiParam = ui;
            }
          };
          wrapperBottomScope.onSorting = function (e, ui) {
            wrapperBottomScope.emittedUiParam = ui;
          };
          spyOn(wrapperBottomScope, 'onSorting').and.callThrough();
          $rootScope.$on('ui-sortable:moved', wrapperBottomScope.onSorting);
        });

        elementTop = wrapperTop.find('> [ui-sortable]');
        elementBottom = wrapperBottom.find('> [ui-sortable]');

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect(itemsTop).toEqual(['Top Two', 'Top Three']);
        expect(itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect(itemsTop).toEqual(listContent(elementTop));
        expect(itemsBottom).toEqual(listContent(elementBottom));

        expect(wrapperTopScope.onSorting).toHaveBeenCalled();
        expect(wrapperTopScope.uiParam.item).toEqual(wrapperTopScope.emittedUiParam.item);

        expect(wrapperBottomScope.onSorting).toHaveBeenCalled();
        expect(wrapperBottomScope.uiParam.item).toEqual(wrapperBottomScope.emittedUiParam.item);

        $(wrapperBottom).remove();
        $(wrapperTop).remove();
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