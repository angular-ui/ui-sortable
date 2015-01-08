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

  var EXTRA_DY_PERCENTAGE, listContent;

  beforeEach(inject(function (sortableTestHelper) {
    EXTRA_DY_PERCENTAGE = sortableTestHelper.EXTRA_DY_PERCENTAGE;
    listContent = sortableTestHelper.listContent;
  }));

  describe('Custom directive options related', function() {

    var host;

    beforeEach(inject(function() {
      host = $('<div id="test-host"></div>');
      $('body').append(host);
    }));

    afterEach(function() {
      host.remove();
      host = null;
    });

    it('should work when "ui-floating: false" option is used', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            'ui-floating': false
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find(':eq(0)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(1)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(1)');
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
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li class="floatleft" ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            'ui-floating': true
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element).append('<div class="clear"></div>');

        var li = element.find(':eq(0)');
        var dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(1)');
        dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(1)');
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
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li class="floatleft" ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            'ui-floating': 'auto'
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element).append('<div class="clear"></div>');

        var li = element.find(':eq(0)');
        var dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(1)');
        dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(1)');
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
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li class="inline-block" ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            'ui-floating': 'auto'
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find(':eq(0)');
        var dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(1)');
        dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqual(listContent(element));

        li = element.find(':eq(1)');
        dx = (1 + EXTRA_DY_PERCENTAGE) * li.outerWidth();
        li.simulate('drag', { dx: dx, moves: 5 });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqual(listContent(element));

        $(element).remove();
      });
    });

  });

});