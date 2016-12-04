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
  beforeEach(module('ui.sortable.testDirectives'));

  var EXTRA_DY_PERCENTAGE, listContent, listFindContent, listInnerContent, simulateElementDrag, beforeLiElement, afterLiElement, beforeDivElement, afterDivElement;

  beforeEach(inject(function (sortableTestHelper) {
    EXTRA_DY_PERCENTAGE = sortableTestHelper.EXTRA_DY_PERCENTAGE;
    listContent = sortableTestHelper.listContent;
    listFindContent = sortableTestHelper.listFindContent;
    listInnerContent = sortableTestHelper.listInnerContent;
    simulateElementDrag = sortableTestHelper.simulateElementDrag;
    beforeLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.beforeLiElement;
    afterLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.afterLiElement;
    beforeDivElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.beforeDivElement;
    afterDivElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.afterDivElement;
  }));

  tests.description = 'Inner directives related';
  function tests (useExtraElements) {

    var host;

    beforeEach(inject(function() {
      host = $('<div id="test-host"></div>');
      $('body').append(host);

      if (!useExtraElements) {
        beforeLiElement = afterLiElement = '';
        beforeDivElement = afterDivElement = '';
      }
    }));

    afterEach(function() {
      host.remove();
      host = null;
    });

    it('should work when inner directives are used', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
            beforeLiElement,
            '<li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">',
              '<ui-sortable-simple-test-directive ng-model="item"></ui-sortable-simple-test-directive>',
            '</li>',
            afterLiElement,
          '</ul>'))($rootScope);

        $rootScope.$apply(function() {
          $rootScope.opts = { };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find('> [ng-repeat]:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqual(listInnerContent(element));

        li = element.find('> [ng-repeat]:eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqual(listInnerContent(element));

        $(element).remove();
      });
    });

    it('should not $destroy directives after sorting.', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
            beforeLiElement,
            '<li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">',
              '<ui-sortable-destroyable-test-directive ng-model="item"></ui-sortable-destroyable-test-directive>',
            '</li>',
            afterLiElement,
          '</ul>'))($rootScope);

        $rootScope.$apply(function() {
          $rootScope.opts = { };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find('> [ng-repeat]:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqual(listInnerContent(element));

        li = element.find('> [ng-repeat]:eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqual(listInnerContent(element));

        $(element).remove();
      });
    });

    it('should work when the items are inside a transcluded directive', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<div ui-sortable="opts" ng-model="items">',
            '<ui-sortable-transclusion-test-directive>',
              beforeLiElement,
              '<div ng-repeat="item in items track by $index" id="s-{{$index}}" class="sortable-item">',
                '{{ item }}',
              '</div>',
              afterLiElement,
            '</ui-sortable-simple-test-directive>',
          '</div>'))($rootScope);

        $rootScope.$apply(function() {
          $rootScope.opts = {
            items: '> * .sortable-item'
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find('.sortable-item:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqual(listFindContent(element));

        li = element.find('.sortable-item:eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqual(listFindContent(element));

        $(element).remove();
      });
    });

    it('should properly cancel() when the items are inside a transcluded directive', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<div ui-sortable="opts" ng-model="items">',
            '<ui-sortable-transclusion-test-directive>',
              beforeLiElement,
              '<div ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">',
                '{{ item }}',
              '</div>',
              afterLiElement,
            '</ui-sortable-simple-test-directive>',
          '</div>'))($rootScope);

        $rootScope.$apply(function() {
          $rootScope.opts = {
            items: '> * .sortable-item',
            update: function(e, ui) {
              if (ui.item.sortable.model === 'Two') {
                ui.item.sortable.cancel();
              }
            }
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find('.sortable-item:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listFindContent(element));
        // try again
        li = element.find('.sortable-item:eq(1)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listFindContent(element));
        // try again
        li = element.find('.sortable-item:eq(1)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqual(listFindContent(element));

        li = element.find('.sortable-item:eq(0)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listFindContent(element));

        li = element.find('.sortable-item:eq(2)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listFindContent(element));


        $(element).remove();
      });
    });

    it('should update model when the items are inside a transcluded directive and sorting between sortables', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<div ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
            '<ui-sortable-transclusion-test-directive>',
              beforeDivElement,
              '<div ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</div>',
              afterDivElement,
            '</ui-sortable-simple-test-directive>',
          '</div>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<div ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
            '<ui-sortable-transclusion-test-directive>',
              beforeDivElement,
              '<div ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</div>',
              afterDivElement,
            '</ui-sortable-simple-test-directive>',
          '</div>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            connectWith: '.cross-sortable',
            items: '> * .sortable-item'
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('.sortable-item:eq(0)');
        var li2 = elementBottom.find('.sortable-item:eq(2)');
        simulateElementDrag(li1, li2, { place: 'above', moves: 100 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Top One', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listFindContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listFindContent(elementBottom));

        // it seems that it ony likes the last spot
        li1 = elementBottom.find('.sortable-item:eq(2)');
        li2 = elementTop.find('.sortable-item:eq(1)');
        simulateElementDrag(li1, li2, { place: 'below', moves: 100 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three', 'Top One']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listFindContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listFindContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should properly cancel() when the items are inside a transcluded directive and sorting between sortables', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<div ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
            '<ui-sortable-transclusion-test-directive>',
              beforeDivElement,
              '<div ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</div>',
              afterDivElement,
            '</ui-sortable-simple-test-directive>',
          '</div>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<div ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
            '<ui-sortable-transclusion-test-directive>',
              beforeDivElement,
              '<div ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</div>',
              afterDivElement,
            '</ui-sortable-simple-test-directive>',
          '</div>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            connectWith: '.cross-sortable',
            items: '> * .sortable-item',
            update: function(e, ui) {
              if (ui.item.sortable.model &&
                (typeof ui.item.sortable.model === 'string') &&
                ui.item.sortable.model.indexOf('Two') >= 0) {
                ui.item.sortable.cancel();
              }
            }
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('.sortable-item:eq(1)');
        var li2 = elementBottom.find('.sortable-item:eq(0)');
        simulateElementDrag(li1, li2, { place: 'below', moves: 100 });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listFindContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listFindContent(elementBottom));
        // try again
        li1 = elementBottom.find('.sortable-item:eq(1)');
        li2 = elementTop.find('.sortable-item:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', moves: 100 });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listFindContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listFindContent(elementBottom));
        // try again
        li1 = elementBottom.find('.sortable-item:eq(1)');
        li2 = elementTop.find('.sortable-item:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', moves: 100 });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listFindContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listFindContent(elementBottom));

        li1 = elementTop.find('.sortable-item:eq(0)');
        li2 = elementBottom.find('.sortable-item:eq(2)');
        simulateElementDrag(li1, li2, { place: 'above', moves: 100 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Top One', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listFindContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listFindContent(elementBottom));

        // it seems that it ony likes the last spot
        li1 = elementBottom.find('.sortable-item:eq(2)');
        li2 = elementTop.find('.sortable-item:eq(1)');
        simulateElementDrag(li1, li2, { place: 'below', moves: 100 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three', 'Top One']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listFindContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listFindContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
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