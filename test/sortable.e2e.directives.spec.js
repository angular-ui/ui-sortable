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

  var EXTRA_DY_PERCENTAGE, listContent, listFindContent, listInnerContent, beforeLiElement, afterLiElement;

  beforeEach(inject(function (sortableTestHelper) {
    EXTRA_DY_PERCENTAGE = sortableTestHelper.EXTRA_DY_PERCENTAGE;
    listContent = sortableTestHelper.listContent;
    listFindContent = sortableTestHelper.listFindContent;
    listInnerContent = sortableTestHelper.listInnerContent;
    beforeLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.beforeLiElement;
    afterLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.afterLiElement;
  }));

  tests.description = 'Inner directives related';
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