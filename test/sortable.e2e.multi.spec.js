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
  
  var EXTRA_DY_PERCENTAGE, listContent, listInnerContent, simulateElementDrag, hasUndefinedProperties, beforeLiElement, afterLiElement;

  beforeEach(inject(function (sortableTestHelper) {
    EXTRA_DY_PERCENTAGE = sortableTestHelper.EXTRA_DY_PERCENTAGE;
    listContent = sortableTestHelper.listContent;
    listInnerContent = sortableTestHelper.listInnerContent;
    simulateElementDrag = sortableTestHelper.simulateElementDrag;
    hasUndefinedProperties = sortableTestHelper.hasUndefinedProperties;
    beforeLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.beforeLiElement;
    afterLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.afterLiElement;
  }));

  tests.description = 'Multiple sortables related';
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

    it('should update model when sorting between sortables', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = { connectWith: '.cross-sortable' };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should update model when sorting between sortables of different scopes', function() {
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
          wrapperBottomScope.itemsBottom = itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = { connectWith: '.cross-sortable' };
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

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect(itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect(itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect(itemsTop).toEqual(listContent(elementTop));
        expect(itemsBottom).toEqual(listContent(elementBottom));

        $(wrapperBottom).remove();
        $(wrapperTop).remove();
      });
    });

    it('should update model when sorting a "falsy" item between sortables', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = [0, 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = { connectWith: '.cross-sortable' };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        function parseFalsyValue (value) {
          if (value === '0') {
            return 0;
          }
          return value;
        }

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 0, 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop).map(parseFalsyValue));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom).map(parseFalsyValue));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 0, 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop).map(parseFalsyValue));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom).map(parseFalsyValue));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "placeholder" option is used', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            placeholder: 'sortable-item-placeholder',
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "placeholder" option equals the class of items', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            placeholder: 'sortable-item',
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "helper: clone" option is used', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            helper: 'clone',
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "placeholder" and "helper: clone" options are used', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            helper: 'clone',
            placeholder: 'sortable-item-placeholder',
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "helper: function" option is used', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            helper: function (e, item) {
              return item.clone().text('helper');
            },
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "placeholder" and "helper: function" options are used', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            helper: function (e, item) {
              return item.clone().text('helper');
            },
            placeholder: 'sortable-item-placeholder',
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "placeholder" and "helper: function" options are used and a drag is reverted', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            helper: function (e, item) {
              return item.clone().text('helper');
            },
            placeholder: 'sortable-item-placeholder',
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(2)');
        var li2 = elementBottom.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'below', action: 'dragAndRevert' });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementTop.find('[ng-repeat]:eq(0)');
        li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementTop.find('[ng-repeat]:eq(2)');
        li2 = elementBottom.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'below', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Top Three', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "helper: function" that returns a list element is used', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            helper: function (e, item) {
              return item;
            },
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "placeholder" and "helper: function" that returns a list element are used', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            helper: function (e, item) {
              return item;
            },
            placeholder: 'sortable-item-placeholder',
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(0)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should cancel sorting of nodes that contain "Two"', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            connectWith: '.cross-sortable',
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

        var li1 = elementTop.find('[ng-repeat]:eq(1)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementTop.find('[ng-repeat]:eq(0)');
        li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should properly set ui.item.sortable properties', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom, updateCallbackExpectations, stopCallbackExpectations;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            connectWith: '.cross-sortable',
            update: function(e, ui) {
              if (ui.item.sortable.model &&
                (typeof ui.item.sortable.model === 'string') &&
                ui.item.sortable.model.indexOf('Two') >= 0) {
                ui.item.sortable.cancel();
              }
              updateCallbackExpectations(ui.item.sortable);
            },
            stop: function(e, ui) {
              stopCallbackExpectations(ui.item.sortable);
            }
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(1)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.model).toEqual('Top Two');
          expect(uiItemSortable.index).toEqual(1);
          expect(uiItemSortable.source.length).toEqual(1);
          expect(uiItemSortable.source[0]).toBe(host.children()[0]);
          expect(uiItemSortable.sourceModel).toBe($rootScope.itemsTop);
          expect(uiItemSortable.isCanceled()).toBe(true);
          expect(uiItemSortable.isCustomHelperUsed()).toBe(false);

          expect(uiItemSortable.dropindex).toEqual(1);
          expect(uiItemSortable.droptarget.length).toBe(1);
          expect(uiItemSortable.droptarget[0]).toBe(host.children()[1]);
          expect(uiItemSortable.droptargetModel).toBe($rootScope.itemsBottom);
        };
        stopCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.received).toBe(true);
          expect(uiItemSortable.moved).toBe(undefined);
        };
        simulateElementDrag(li1, li2, { place: 'below', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = stopCallbackExpectations = undefined;

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.model).toEqual('Bottom Two');
          expect(uiItemSortable.index).toEqual(1);
          expect(uiItemSortable.source.length).toEqual(1);
          expect(uiItemSortable.source[0]).toBe(host.children()[1]);
          expect(uiItemSortable.sourceModel).toBe($rootScope.itemsBottom);
          expect(uiItemSortable.isCanceled()).toBe(true);
          expect(uiItemSortable.isCustomHelperUsed()).toBe(false);

          expect(uiItemSortable.dropindex).toEqual(1);
          expect(uiItemSortable.droptarget.length).toBe(1);
          expect(uiItemSortable.droptarget[0]).toBe(host.children()[0]);
          expect(uiItemSortable.droptargetModel).toBe($rootScope.itemsTop);
        };
        stopCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.received).toBe(true);
          expect(uiItemSortable.moved).toBe(undefined);
        };
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = stopCallbackExpectations = undefined;

        li1 = elementTop.find('[ng-repeat]:eq(0)');
        li2 = elementBottom.find('[ng-repeat]:eq(0)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.model).toEqual('Top One');
          expect(uiItemSortable.index).toEqual(0);
          expect(uiItemSortable.source.length).toEqual(1);
          expect(uiItemSortable.source[0]).toBe(host.children()[0]);
          expect(uiItemSortable.sourceModel).toBe($rootScope.itemsTop);
          expect(uiItemSortable.isCanceled()).toBe(false);
          expect(uiItemSortable.isCustomHelperUsed()).toBe(false);

          expect(uiItemSortable.dropindex).toEqual(1);
          expect(uiItemSortable.droptarget.length).toBe(1);
          expect(uiItemSortable.droptarget[0]).toBe(host.children()[1]);
          expect(uiItemSortable.droptargetModel).toBe($rootScope.itemsBottom);
        };
        stopCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.received).toBe(true);
          expect(uiItemSortable.moved).toBe('Top One');
        };
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = stopCallbackExpectations = undefined;

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.model).toEqual('Top One');
          expect(uiItemSortable.index).toEqual(1);
          expect(uiItemSortable.source.length).toEqual(1);
          expect(uiItemSortable.source[0]).toBe(host.children()[1]);
          expect(uiItemSortable.sourceModel).toBe($rootScope.itemsBottom);
          expect(uiItemSortable.isCanceled()).toBe(false);
          expect(uiItemSortable.isCustomHelperUsed()).toBe(false);

          expect(uiItemSortable.dropindex).toEqual(1);
          expect(uiItemSortable.droptarget.length).toBe(1);
          expect(uiItemSortable.droptarget[0]).toBe(host.children()[0]);
          expect(uiItemSortable.droptargetModel).toBe($rootScope.itemsTop);
        };
        stopCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.received).toBe(true);
          expect(uiItemSortable.moved).toBe('Top One');
        };
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = stopCallbackExpectations = undefined;

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should properly set ui.item.sortable.droptargetModel when using data-ng-model', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom, updateCallbackExpectations;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" data-ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" data-ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            connectWith: '.cross-sortable',
            update: function(e, ui) {
              if (ui.item.sortable.model &&
                (typeof ui.item.sortable.model === 'string') &&
                ui.item.sortable.model.indexOf('Two') >= 0) {
                ui.item.sortable.cancel();
              }
              updateCallbackExpectations(ui.item.sortable);
            }
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(1)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.droptargetModel).toBe($rootScope.itemsBottom);
        };
        simulateElementDrag(li1, li2, { place: 'below', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = undefined;

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.droptargetModel).toBe($rootScope.itemsTop);
        };
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = undefined;

        li1 = elementTop.find('[ng-repeat]:eq(0)');
        li2 = elementBottom.find('[ng-repeat]:eq(0)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.droptargetModel).toBe($rootScope.itemsBottom);
        };
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = undefined;

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.droptargetModel).toBe($rootScope.itemsTop);
        };
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = undefined;

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should properly set ui.item.sortable.droptargetModel when sorting between different scopes', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom,
            wrapperTop, wrapperBottom,
            wrapperTopScope, wrapperBottomScope,
            itemsTop, itemsBottom,
            updateCallbackExpectations;
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
          wrapperBottomScope.itemsBottom = itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            connectWith: '.cross-sortable',
            update: function(e, ui) {
              if (ui.item.sortable.model &&
                (typeof ui.item.sortable.model === 'string') &&
                ui.item.sortable.model.indexOf('Two') >= 0) {
                ui.item.sortable.cancel();
              }
              updateCallbackExpectations(ui.item.sortable);
            }
          };
        });

        elementTop = wrapperTop.find('> [ui-sortable]');
        elementBottom = wrapperBottom.find('> [ui-sortable]');

        var li1 = elementTop.find('[ng-repeat]:eq(1)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.droptargetModel).toBe(itemsBottom);
        };
        simulateElementDrag(li1, li2, { place: 'below', extradx: -20, extrady: -11 });
        expect(itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect(itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect(itemsTop).toEqual(listContent(elementTop));
        expect(itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = undefined;

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.droptargetModel).toBe(itemsTop);
        };
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect(itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect(itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect(itemsTop).toEqual(listContent(elementTop));
        expect(itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = undefined;

        li1 = elementTop.find('[ng-repeat]:eq(0)');
        li2 = elementBottom.find('[ng-repeat]:eq(0)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.droptargetModel).toBe(itemsBottom);
        };
        simulateElementDrag(li1, li2, 'below');
        expect(itemsTop).toEqual(['Top Two', 'Top Three']);
        expect(itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect(itemsTop).toEqual(listContent(elementTop));
        expect(itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = undefined;

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        updateCallbackExpectations = function(uiItemSortable) {
          expect(uiItemSortable.droptargetModel).toBe(itemsTop);
        };
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect(itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect(itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect(itemsTop).toEqual(listContent(elementTop));
        expect(itemsBottom).toEqual(listContent(elementBottom));
        updateCallbackExpectations = undefined;

        $(wrapperTop).remove();
        $(wrapperBottom).remove();
      });
    });

    it('should properly free ui.item.sortable object', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom, uiItem, uiItemSortable_Destroy;
        elementTop = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop">',
          beforeLiElement,
          '<li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        elementBottom = $compile(''.concat(
          '<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom">',
          beforeLiElement,
          '<li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            connectWith: '.cross-sortable',
            start: function (e, ui) {
              uiItem = ui.item;
              spyOn(ui.item.sortable, '_destroy').and.callThrough();
              uiItemSortable_Destroy = ui.item.sortable._destroy;
            },
            update: function(e, ui) {
              uiItem.sortable = ui.item.sortable;
              if (ui.item.sortable.model &&
                (typeof ui.item.sortable.model === 'string') &&
                ui.item.sortable.model.indexOf('Two') >= 0) {
                ui.item.sortable.cancel();
              }
            }
          };
        });

        host.append(elementTop).append(elementBottom).append('<div class="clear"></div>');

        var li1 = elementTop.find('[ng-repeat]:eq(1)');
        var li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        expect(uiItemSortable_Destroy).toHaveBeenCalled();
        expect(hasUndefinedProperties(uiItem.sortable)).toBe(true);
        uiItem = uiItemSortable_Destroy = undefined;

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        expect(uiItemSortable_Destroy).toHaveBeenCalled();
        expect(hasUndefinedProperties(uiItem.sortable)).toBe(true);
        uiItem = uiItemSortable_Destroy = undefined;

        li1 = elementTop.find('[ng-repeat]:eq(0)');
        li2 = elementBottom.find('[ng-repeat]:eq(0)');
        simulateElementDrag(li1, li2, 'below');
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        expect(uiItemSortable_Destroy).toHaveBeenCalled();
        expect(hasUndefinedProperties(uiItem.sortable)).toBe(true);
        uiItem = uiItemSortable_Destroy = undefined;

        li1 = elementBottom.find('[ng-repeat]:eq(1)');
        li2 = elementTop.find('[ng-repeat]:eq(1)');
        simulateElementDrag(li1, li2, { place: 'above', extradx: -20, extrady: -11 });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqual(listContent(elementTop));
        expect($rootScope.itemsBottom).toEqual(listContent(elementBottom));
        expect(uiItemSortable_Destroy).toHaveBeenCalled();
        expect(hasUndefinedProperties(uiItem.sortable)).toBe(true);
        uiItem = uiItemSortable_Destroy = undefined;

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