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

  var EXTRA_DY_PERCENTAGE, listContent, beforeLiElement, afterLiElement;

  beforeEach(inject(function (sortableTestHelper) {
    EXTRA_DY_PERCENTAGE = sortableTestHelper.EXTRA_DY_PERCENTAGE;
    listContent = sortableTestHelper.listContent;
    beforeLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.beforeLiElement;
    afterLiElement = sortableTestHelper.extraElements && sortableTestHelper.extraElements.afterLiElement;
  }));

  tests.description = 'Custom directive options related';
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

    it('should work when "ui-floating: false" option is used', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            'ui-floating': false
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find('[ng-repeat]:eq(0)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(1)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(1)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        $(element).remove();
      });
    });

    it('should work when "ui-floating: true" option is used', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement.replace('<li>', '<li class="floatleft">'),
          '<li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item floatleft">{{ item }}</li>',
          afterLiElement.replace('<li>', '<li class="floatleft">'),
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            'ui-floating': true
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element).append('<div class="clear"></div>');

        var li = element.find('[ng-repeat]:eq(0)');
        var dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(1)');
        dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(1)');
        dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx, moves: 5 });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        $(element).remove();
      });
    });

    it('should work when "ui-floating: \'auto\'" option is used and elements are "float"ing', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement.replace('<li>', '<li class="floatleft">'),
          '<li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item floatleft">{{ item }}</li>',
          afterLiElement.replace('<li>', '<li class="floatleft">'),
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            'ui-floating': 'auto'
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element).append('<div class="clear"></div>');

        var li = element.find('[ng-repeat]:eq(0)');
        var dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(1)');
        dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(1)');
        dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx, moves: 5 });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        $(element).remove();
      });
    });

    it('should work when "ui-floating: \'auto\'" option is used and elements are "display: inline-block"', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement.replace('<li>', '<li class="inline-block">'),
          '<li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item inline-block">{{ item }}</li>',
          afterLiElement.replace('<li>', '<li class="inline-block">'),
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            'ui-floating': 'auto'
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find('[ng-repeat]:eq(0)');
        var dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(1)');
        dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find('[ng-repeat]:eq(1)');
        dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx, moves: 5 });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        $(element).remove();
      });
    });

    it('should properly reset deleted directive options', function() {
      inject(function($compile, $rootScope) {
        var element, logsElement;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}" sortable-item>{{ item }}</li>',
          afterLiElement +
          '</ul>'))($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            'ui-floating': true,
            'ui-model-items': '> [sortable-item]'
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element).append(logsElement);

        var sortableWidgetInstance = element.data('ui-sortable');
        
        expect(sortableWidgetInstance.floating).toBe(true);

        $rootScope.$digest();
          
        $rootScope.$apply(function() {
          $rootScope.opts = {};
        });

        var li = element.find('[ng-repeat]:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqual(listContent(element));
        expect(sortableWidgetInstance.floating).toBe(false);

        $(element).remove();
        $(logsElement).remove();
      });
    });

    it('should work when custom "ui-model-items" option is used with an attribute selector', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item" ui-sortable-item>{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);

        var itemsSelector = '[ui-sortable-item]';
        $rootScope.$apply(function() {
          $rootScope.opts = {
            items: '> ' + itemsSelector,
            'ui-model-items': '> ' + itemsSelector
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element).append('<div class="clear"></div>');

        var li = element.find(itemsSelector + ':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(itemsSelector + ':eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqual(listContent(element));

        $(element).remove();
      });
    });

    it('should work when custom "ui-model-items" option is used with a class selector', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          '<li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item ui-sortable-item">{{ item }}</li>',
          afterLiElement,
          '</ul>'))($rootScope);

        var itemsSelector = '.ui-sortable-item';
        $rootScope.$apply(function() {
          $rootScope.opts = {
            items: '> ' + itemsSelector,
            'ui-model-items': '> ' + itemsSelector
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element).append('<div class="clear"></div>');

        var li = element.find(itemsSelector + ':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(itemsSelector + ':eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqual(listContent(element));

        $(element).remove();
      });
    });

    xit('should work with multiple [ng-repeat] when attribute "ui-model-items" selector', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          beforeLiElement.replace('<li>', '<li ng-repeat="item in items" id="pre-{{$index}}" class="sortable-item">{{ item }}'),
          '<li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item" ui-sortable-item>{{ item }}</li>',
          afterLiElement.replace('<li>', '<li ng-repeat="item in items" id="after-{{$index}}" class="sortable-item">{{ item }}'),
          afterLiElement,
          '</ul>'))($rootScope);

        var itemsSelector = '[ui-sortable-item]';
        $rootScope.$apply(function() {
          $rootScope.opts = {
            items: '> ' + itemsSelector,
            'ui-model-items': '> ' + itemsSelector
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element).append('<div class="clear"></div>');

        var li = element.find(itemsSelector + ':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqual(listContent(element, itemsSelector));

        li = element.find(itemsSelector + ':eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqual(listContent(element, itemsSelector));

        $(element).remove();
      });
    });

    xit('should work with multiple [ng-repeat] when class "ui-model-items" selector', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile(''.concat(
          '<ul ui-sortable="opts" ng-model="items">',
          beforeLiElement,
          beforeLiElement.replace('<li>', '<li ng-repeat="item in items" id="pre-{{$index}}" class="sortable-item">{{ item }}'),
          '<li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item ui-sortable-item">{{ item }}</li>',
          afterLiElement.replace('<li>', '<li ng-repeat="item in items" id="after-{{$index}}" class="sortable-item">{{ item }}'),
          afterLiElement,
          '</ul>'))($rootScope);

        var itemsSelector = '.ui-sortable-item';
        $rootScope.$apply(function() {
          $rootScope.opts = {
            items: '> ' + itemsSelector,
            'ui-model-items': '> ' + itemsSelector
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element).append('<div class="clear"></div>');

        var li = element.find(itemsSelector + ':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqual(listContent(element, itemsSelector));

        li = element.find(itemsSelector + ':eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqual(listContent(element, itemsSelector));

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