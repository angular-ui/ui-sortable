'use strict';

describe('uiSortable', function() {

  // Ensure the sortable angular module is loaded
  beforeEach(module('ui.sortable'));

  beforeEach(function() {
    this.addMatchers({
      toEqualListContent: function (list) {
        if (list && list.length) {
          return list.children().map(function(){ return this.innerHTML; }).toArray();
        }
        return [];
      },
      toEqualListInnerContent: function (list) {
        if (list && list.length) {
          return list.children().map(function(){ return $(this).find('.itemContent').html(); }).toArray();
        }
        return [];
      }
    });
  });

  var EXTRA_DY_PERCENTAGE = 0.25;

  describe('Simple use', function() {

    it('should have a ui-sortable class', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable></ul>')($rootScope);
        expect(element.hasClass('ui-sortable')).toBeTruthy();
      });
    });

    it('should log that ngModel was not provided', function() {
      inject(function($compile, $rootScope, $log) {
        var element;
        element = $compile('<ul ui-sortable><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        expect($log.info.logs.length).toEqual(1);
        expect($log.info.logs[0].length).toEqual(2);
        expect($log.info.logs[0][0]).toEqual('ui.sortable: ngModel not provided!');
      });
    });

  });


  describe('Drag & Drop simulation', function() {

    var host;

    beforeEach(inject(function() {
      host = $('<div id="test-host"></div>');
      $('body').append(host);
    }));

    afterEach(function() {
      host.remove();
      host = null;
    });

    it('should update model when order changes', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find(':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqualListContent(element);

        li = element.find(':eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqualListContent(element);

        $(element).remove();
      });
    });

    it('should not allow sorting of "locked" nodes', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}" ng-class="{ sortable: item.sortable }">{{ item.text }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            items:'> .sortable'
          };
          $rootScope.items = [
            { text: 'One', sortable: true },
            { text: 'Two', sortable: true },
            { text: 'Three', sortable: false },
            { text: 'Four', sortable: true }
          ];
        });

        host.append(element);

        var li = element.find(':eq(2)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items.map(function(x){ return x.text; })).toEqual(['One', 'Two', 'Three', 'Four']);
        expect($rootScope.items.map(function(x){ return x.text; })).toEqualListContent(element);

        li = element.find(':eq(1)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items.map(function(x){ return x.text; })).toEqual(['One', 'Three', 'Four', 'Two']);
        expect($rootScope.items.map(function(x){ return x.text; })).toEqualListContent(element);

        li = element.find(':eq(2)');
        dy = -(2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items.map(function(x){ return x.text; })).toEqual(['Four', 'One', 'Three', 'Two']);
        expect($rootScope.items.map(function(x){ return x.text; })).toEqualListContent(element);

        li = element.find(':eq(3)');
        dy = -(2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items.map(function(x){ return x.text; })).toEqual(['Four', 'Two', 'One', 'Three']);
        expect($rootScope.items.map(function(x){ return x.text; })).toEqualListContent(element);

        // also placing right above the locked node seems a bit harder !?!?

        $(element).remove();
      });
    });

    it('should work when "placeholder" option is used', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            placeholder: 'sortable-item-placeholder'
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find(':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqualListContent(element);

        li = element.find(':eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqualListContent(element);

        $(element).remove();
      });
    });

    it('should work when "placeholder" option equals the class of items', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            placeholder: 'sortable-item'
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find(':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqualListContent(element);

        li = element.find(':eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqualListContent(element);

        $(element).remove();
      });
    });

    it('should continue to work after a drag is reverted', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            placeholder: 'sortable-item'
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find(':eq(0)');
        var dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('dragAndRevert', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqualListContent(element);

        li = element.find(':eq(0)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqualListContent(element);

        li = element.find(':eq(1)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqualListContent(element);

        li = element.find(':eq(1)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'One', 'Three']);
        expect($rootScope.items).toEqualListContent(element);

        $(element).remove();
      });
    });

    it('should work when "handle" option is used', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}"><span class="handle">H</span> <span class="itemContent">{{ item }}</span></li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            handle: '.handle'
          };
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        host.append(element);

        var li = element.find('li:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.find('.handle').simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqualListInnerContent(element);

        li = element.find('li:eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.find('.handle').simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'One', 'Two']);
        expect($rootScope.items).toEqualListInnerContent(element);

        $(element).remove();
      });
    });

    it('should properly remove elements after a sorting', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}"><span class="handle">H</span> <span class="itemContent">{{ item }}</span> <button type="button" class="removeButton" ng-click="remove(item, $index)">X</button></li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            handle: '.handle'
          };
          $rootScope.items = ['One', 'Two', 'Three'];

          $rootScope.remove = function (item, itemIndex) {
            $rootScope.items.splice(itemIndex, 1);
          };
        });

        host.append(element);

        var li = element.find('li:eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.find('.handle').simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Three', 'Two']);
        expect($rootScope.items).toEqualListInnerContent(element);

        li = element.find('li:eq(1)');
        li.find('.removeButton').click();
        expect($rootScope.items).toEqual(['One', 'Two']);
        expect($rootScope.items).toEqualListInnerContent(element);

        li = element.find('li:eq(0)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.find('.handle').simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'One']);
        expect($rootScope.items).toEqualListInnerContent(element);

        li = element.find('li:eq(0)');
        li.find('.removeButton').click();
        expect($rootScope.items).toEqual(['One']);
        expect($rootScope.items).toEqualListInnerContent(element);

        $(element).remove();
      });
    });

    it('should properly remove elements after a drag is reverted', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}"><span class="handle">H</span> <span class="itemContent">{{ item }}</span> <button type="button" class="removeButton" ng-click="remove(item, $index)">X</button></li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts = {
            handle: '.handle'
          };
          $rootScope.items = ['One', 'Two', 'Three'];

          $rootScope.remove = function (item, itemIndex) {
            $rootScope.items.splice(itemIndex, 1);
          };
        });

        host.append(element);

        var li = element.find('li:eq(0)');
        var dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.find('.handle').simulate('dragAndRevert', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqualListInnerContent(element);

        li = element.find('li:eq(0)');
        li.find('.removeButton').click();
        expect($rootScope.items).toEqual(['Two', 'Three']);
        expect($rootScope.items).toEqualListInnerContent(element);

        li = element.find('li:eq(0)');
        dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.find('.handle').simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Three', 'Two']);
        expect($rootScope.items).toEqualListInnerContent(element);

        $(element).remove();
      });
    });

  });

  describe('Multiple sortables related', function() {

    var host;

    beforeEach(inject(function() {
      host = $('<div id="test-host"></div>');
      $('body').append(host);
    }));

    afterEach(function() {
      host.remove();
      host = null;
    });

    it('should update model when sorting between sortables', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop"><li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li></ul>')($rootScope);
        elementBottom = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom"><li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = { connectWith: '.cross-sortable' };
        });

        host.append(elementTop).append(elementBottom);

        var li1 = elementTop.find(':eq(0)');
        var li2 = elementBottom.find(':eq(0)');
        var dy = EXTRA_DY_PERCENTAGE * li1.outerHeight() + (li2.position().top - li1.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        li1 = elementBottom.find(':eq(1)');
        li2 = elementTop.find(':eq(1)');
        dy = -EXTRA_DY_PERCENTAGE * li1.outerHeight() - (li1.position().top - li2.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should update model when sorting a "falsy" item between sortables', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop"><li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li></ul>')($rootScope);
        elementBottom = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom"><li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = [0, 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = { connectWith: '.cross-sortable' };
        });

        host.append(elementTop).append(elementBottom);

        var li1 = elementTop.find(':eq(0)');
        var li2 = elementBottom.find(':eq(0)');
        var dy = EXTRA_DY_PERCENTAGE * li1.outerHeight() + (li2.position().top - li1.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 0, 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        li1 = elementBottom.find(':eq(1)');
        li2 = elementTop.find(':eq(1)');
        dy = -EXTRA_DY_PERCENTAGE * li1.outerHeight() - (li1.position().top - li2.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top Two', 0, 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "placeholder" option is used', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop"><li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        elementBottom = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom"><li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            placeholder: 'sortable-item-placeholder',
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom);

        var li1 = elementTop.find(':eq(0)');
        var li2 = elementBottom.find(':eq(0)');
        var dy = EXTRA_DY_PERCENTAGE * li1.outerHeight() + (li2.position().top - li1.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        li1 = elementBottom.find(':eq(1)');
        li2 = elementTop.find(':eq(1)');
        dy = -EXTRA_DY_PERCENTAGE * li1.outerHeight() - (li1.position().top - li2.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

    it('should work when "placeholder" option equals the class of items', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop"><li ng-repeat="item in itemsTop" id="s-top-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        elementBottom = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom"><li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}" class="sortable-item">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            placeholder: 'sortable-item',
            connectWith: '.cross-sortable'
          };
        });

        host.append(elementTop).append(elementBottom);

        var li1 = elementTop.find(':eq(0)');
        var li2 = elementBottom.find(':eq(0)');
        var dy = EXTRA_DY_PERCENTAGE * li1.outerHeight() + (li2.position().top - li1.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        li1 = elementBottom.find(':eq(1)');
        li2 = elementTop.find(':eq(1)');
        dy = -EXTRA_DY_PERCENTAGE * li1.outerHeight() - (li1.position().top - li2.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

  });


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
        expect($rootScope.items).toEqualListContent(element);

        li = element.find(':eq(0)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['Two', 'Three', 'One']);
        expect($rootScope.items).toEqualListContent(element);

        li = element.find(':eq(2)');
        dy = -(2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(['One', 'Two', 'Three']);
        expect($rootScope.items).toEqualListContent(element);

        $(element).remove();
      });
    });

    it('should cancel sorting of nodes that contain "Two"', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop"><li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li></ul>')($rootScope);
        elementBottom = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom"><li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ['Top One', 'Top Two', 'Top Three'];
          $rootScope.itemsBottom = ['Bottom One', 'Bottom Two', 'Bottom Three'];
          $rootScope.opts = {
            connectWith: '.cross-sortable',
            update: function(e, ui) {
              if (ui.item.scope() &&
                (typeof ui.item.scope().item === 'string') &&
                ui.item.scope().item.indexOf('Two') >= 0) {
                ui.item.sortable.cancel();
              }
            }
          };
        });

        host.append(elementTop).append(elementBottom);

        var li1 = elementTop.find(':eq(1)');
        var li2 = elementBottom.find(':eq(0)');
        var dy = EXTRA_DY_PERCENTAGE * li1.outerHeight() + (li2.position().top - li1.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        li1 = elementBottom.find(':eq(1)');
        li2 = elementTop.find(':eq(1)');
        dy = -EXTRA_DY_PERCENTAGE * li1.outerHeight() - (li1.position().top - li2.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top One', 'Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        li1 = elementTop.find(':eq(0)');
        li2 = elementBottom.find(':eq(0)');
        dy = EXTRA_DY_PERCENTAGE * li1.outerHeight() + (li2.position().top - li1.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Top One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        li1 = elementBottom.find(':eq(1)');
        li2 = elementTop.find(':eq(1)');
        dy = -EXTRA_DY_PERCENTAGE * li1.outerHeight() - (li1.position().top - li2.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(['Top Two', 'Top One', 'Top Three']);
        expect($rootScope.itemsBottom).toEqual(['Bottom One', 'Bottom Two', 'Bottom Three']);
        expect($rootScope.itemsTop).toEqualListContent(elementTop);
        expect($rootScope.itemsBottom).toEqualListContent(elementBottom);

        $(elementTop).remove();
        $(elementBottom).remove();
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
        expect($rootScope.items).toEqualListContent(element);
        expect($rootScope.logs).toEqualListContent(logsElement);

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
        expect($rootScope.items).toEqualListContent(element);
        expect($rootScope.logs).toEqualListContent(logsElement);

        $(element).remove();
        $(logsElement).remove();
      });
    });

  });

});