describe('uiSortable', function() {

  // Ensure the sortable angular module is loaded
  beforeEach(module('ui.sortable'));

  var EXTRA_DY_PERCENTAGE = 0.25;

  describe('simple use', function() {

    it('should have a ui-sortable class', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile("<ul ui-sortable></ul>")($rootScope);
        expect(element.hasClass("ui-sortable")).toBeTruthy();
      });
    });

    it('should log that ngModel was not provided', function() {
      inject(function($compile, $rootScope, $log) {
        var element;
        element = $compile('<ul ui-sortable><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.items = ["One", "Two", "Three"];
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
          $rootScope.items = ["One", "Two", "Three"];
        });

        host.append(element);

        var li = element.find(':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(["One", "Three", "Two"]);

        li = element.find(':eq(1)');
        dy = -(1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(["Three", "One", "Two"]);

        $(element).remove();
      });
    });

    it('should cancel sorting of node "Two"', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts ={
            update: function(e, ui) {
              if (ui.item.scope().item === "Two") {
                ui.item.parent().sortable('cancel');
              }
            }
          };
          $rootScope.items = ["One", "Two", "Three"];
        });

        host.append(element);

        var li = element.find(':eq(1)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(["One", "Two", "Three"]);

        li = element.find(':eq(0)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items).toEqual(["Two", "Three", "One"]);

        $(element).remove();
      });
    });

    it('should update model from stop() callback', function() {
      inject(function($compile, $rootScope) {
        // TODO
      });
    });

    it('should not allow sorting of "locked" nodes', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}" ng-class="{ sortable: item.sortable }">{{ item.text }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.opts ={
            items:'> .sortable'
          };
          $rootScope.items = [
            { text: "One", sortable: true },
            { text: "Two", sortable: true },
            { text: "Three", sortable: false },
            { text: "Four", sortable: true }
          ];
        });

        host.append(element);

        var li = element.find(':eq(2)');
        var dy = (1 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items.map(function(x){ return x.text; })).toEqual(["One", "Two", "Three", "Four"]);

        li = element.find(':eq(1)');
        dy = (2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items.map(function(x){ return x.text; })).toEqual(["One", "Three", "Four", "Two"]);

        // fails on angular 1.2
        li = element.find(':eq(2)');
        dy = -(2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items.map(function(x){ return x.text; })).toEqual(["Four", "One", "Three", "Two"]);

        // fails on angular 1.2
        li = element.find(':eq(3)');
        dy = -(2 + EXTRA_DY_PERCENTAGE) * li.outerHeight();
        li.simulate('drag', { dy: dy });
        expect($rootScope.items.map(function(x){ return x.text; })).toEqual(["Four", "Two", "One", "Three"]);

        // also placing right above the locked node seems a bit harder !?!?

        $(element).remove();
      });
    });

    it('should update model when sorting between sortables', function() {
      inject(function($compile, $rootScope) {
        var elementTop, elementBottom;
        elementTop = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsTop"><li ng-repeat="item in itemsTop" id="s-top-{{$index}}">{{ item }}</li></ul>')($rootScope);
        elementBottom = $compile('<ul ui-sortable="opts" class="cross-sortable" ng-model="itemsBottom"><li ng-repeat="item in itemsBottom" id="s-bottom-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.itemsTop = ["Top One", "Top Two", "Top Three"];
          $rootScope.itemsBottom = ["Bottom One", "Bottom Two", "Bottom Three"];
          $rootScope.opts = { connectWith: ".cross-sortable" };
        });

        host.append(elementTop).append(elementBottom);

        // fails on angular 1.2
        var li1 = elementTop.find(':eq(0)');
        var li2 = elementBottom.find(':eq(0)');
        var dy = EXTRA_DY_PERCENTAGE * li1.outerHeight() + (li2.position().top - li1.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(["Top Two", "Top Three"]);
        expect($rootScope.itemsBottom).toEqual(["Bottom One", "Top One", "Bottom Two", "Bottom Three"]);

        // fails on angular 1.2
        li1 = elementBottom.find(':eq(1)');
        li2 = elementTop.find(':eq(1)');
        dy = -EXTRA_DY_PERCENTAGE * li1.outerHeight() - (li1.position().top - li2.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.itemsTop).toEqual(["Top Two", "Top One", "Top Three"]);
        expect($rootScope.itemsBottom).toEqual(["Bottom One", "Bottom Two", "Bottom Three"]);

        $(elementTop).remove();
        $(elementBottom).remove();
      });
    });

  });

});