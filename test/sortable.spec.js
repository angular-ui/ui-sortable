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

  var listContent;

  beforeEach(inject(function (sortableTestHelper) {
    listContent = sortableTestHelper.listContent;
  }));

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

    it('should log an error about jQuery dependency', function() {
      inject(function($compile, $rootScope, $log) {
        var oldAngularElementFn = angular.element.fn;
        var mockJQliteFn = $({}, angular.element.fn, true);
        mockJQliteFn.jquery = null;
        angular.element.fn = mockJQliteFn;

        var element;
        element = $compile('<ul ui-sortable><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          $rootScope.items = ['One', 'Two', 'Three'];
        });

        expect($log.error.logs.length).toEqual(1);
        expect($log.error.logs[0].length).toEqual(1);
        expect($log.error.logs[0][0]).toEqual('ui.sortable: jQuery should be included before AngularJS!');

        angular.element.fn = oldAngularElementFn;
      });
    });

    it('should refresh sortable properly after an apply', function() {
      inject(function($compile, $rootScope, $timeout) {
        var element;
        var childScope = $rootScope.$new();
        element = $compile('<ul ui-sortable ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul>')(childScope);
        $rootScope.$apply(function() {
          childScope.items = ['One', 'Two', 'Three'];
        });

        expect(function() {
          $timeout.flush();
        }).not.toThrow();

        expect(childScope.items).toEqual(['One', 'Two', 'Three']);
        expect(childScope.items).toEqual(listContent(element));
      });
    });

    it('should refresh sortable properly after an apply [data-* anotation]', function() {
      inject(function($compile, $rootScope, $timeout) {
        var element;
        var childScope = $rootScope.$new();
        element = $compile('<ul data-ui-sortable="opts" data-ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul>')(childScope);
        $rootScope.$apply(function() {
          childScope.items = ['One', 'Two', 'Three'];
          childScope.opts = {};
        });

        expect(function() {
          $timeout.flush();
        }).not.toThrow();

        expect(childScope.items).toEqual(['One', 'Two', 'Three']);
        expect(childScope.items).toEqual(listContent(element));
      });
    });

    it('should not refresh sortable if destroyed', function() {
      inject(function($compile, $rootScope, $timeout) {
        var element;
        var childScope = $rootScope.$new();
        element = $compile('<div><ul ui-sortable ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul></div>')(childScope);
        $rootScope.$apply(function() {
          childScope.items = ['One', 'Two', 'Three'];
        });

        element.remove(element.firstChild);
        expect(function() {
          $timeout.flush();
        }).not.toThrow();

      });
    });

    it('should not refresh sortable if destroyed [data-* anotation]', function() {
      inject(function($compile, $rootScope, $timeout) {
        var element;
        var childScope = $rootScope.$new();
        element = $compile('<div><ul data-ui-sortable="opts" data-ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul></div>')(childScope);
        $rootScope.$apply(function() {
          childScope.items = ['One', 'Two', 'Three'];
          childScope.opts = {};
        });

        element.remove(element.firstChild);
        expect(function() {
          $timeout.flush();
        }).not.toThrow();

      });
    });

    it('should not try to apply options to a destroyed sortable', function() {
      inject(function($compile, $rootScope, $timeout) {
        var element;
        var childScope = $rootScope.$new();
        element = $compile('<div><ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul></div>')(childScope);
        $rootScope.$apply(function() {
          childScope.items = ['One', 'Two', 'Three'];
          childScope.opts = {
            update: function() {}
          };

          element.remove(element.firstChild);
        });

        expect(function() {
          $timeout.flush();
        }).not.toThrow();

      });
    });

    it('should not try to apply options to a destroyed sortable [data-* anotation]', function() {
      inject(function($compile, $rootScope, $timeout) {
        var element;
        var childScope = $rootScope.$new();
        element = $compile('<div><ul data-ui-sortable="opts" data-ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul></div>')(childScope);
        $rootScope.$apply(function() {
          childScope.items = ['One', 'Two', 'Three'];
          childScope.opts = {
            update: function() {}
          };

          element.remove(element.firstChild);
        });

        expect(function() {
          $timeout.flush();
        }).not.toThrow();

      });
    });

    describe('items option', function() {

      it('should use a default items that is restricted to ng-repeat items', function() {

        inject(function($compile, $rootScope, $timeout) {
          var element;
          var childScope = $rootScope.$new();
          element = $compile('<div><ul data-ui-sortable="opts" data-ng-model="items"></ul></div>')(childScope);

          $rootScope.$digest();

          expect(element.find('ul').sortable('option', 'items')).toBe('> [ng-repeat],> [data-ng-repeat],> [x-ng-repeat]');

          element.remove(element.firstChild);

          expect(function() {
            $timeout.flush();
          }).not.toThrow();

        });

      });

      it('should not change items option if given', function() {

        inject(function($compile, $rootScope, $timeout) {
          var element;
          var childScope = $rootScope.$new();
          childScope.opts = {
            items: '> .class'
          };

          element = $compile('<div><ul data-ui-sortable="opts" data-ng-model="items"></ul></div>')(childScope);

          $rootScope.$digest();

          expect(element.find('ul').sortable('option', 'items')).toBe('> .class');

          element.remove(element.firstChild);

          expect(function() {
            $timeout.flush();
          }).not.toThrow();

        });

      });

      it('should restrict to ng-items if items is removed after initialization', function() {

        inject(function($compile, $rootScope, $timeout) {
          var element;
          var childScope = $rootScope.$new();
          childScope.opts = {
            items: '> .class'
          };

          element = $compile('<div><ul data-ui-sortable="opts" data-ng-model="items"></ul></div>')(childScope);

          $rootScope.$digest();

          $rootScope.$apply(function() {
            childScope.opts = { items: null };
          });

          expect(element.find('ul').sortable('option', 'items')).toBe('> [ng-repeat],> [data-ng-repeat],> [x-ng-repeat]');

          element.remove(element.firstChild);

          expect(function() {
            $timeout.flush();
          }).not.toThrow();

        });

      });

      it('should properly reset the value of a deleted option', function() {

        inject(function($compile, $rootScope, $timeout) {
          var element;
          var childScope = $rootScope.$new();
          childScope.opts = {
            opacity: 0.7,
            placeholder: 'phClass',
            update: function() { }
          };

          element = $compile('<div><ul data-ui-sortable="opts" data-ng-model="items"></ul></div>')(childScope);
          var $sortableElement = element.find('[data-ui-sortable]');

          expect($sortableElement.sortable('option', 'opacity')).toBe(0.7);
          expect($sortableElement.sortable('option', 'placeholder')).toBe('phClass');
          expect(typeof $sortableElement.sortable('option', 'update')).toBe('function');

          $rootScope.$digest();

          $rootScope.$apply(function() {
            delete childScope.opts.opacity;
          });

          expect($sortableElement.sortable('option', 'opacity')).toBe(false);
          expect($sortableElement.sortable('option', 'placeholder')).toBe('phClass');
          expect(typeof $sortableElement.sortable('option', 'update')).toBe('function');

          $rootScope.$digest();

          $rootScope.$apply(function() {
            childScope.opts = {};
          });

          expect($sortableElement.sortable('option', 'opacity')).toBe(false);
          expect($sortableElement.sortable('option', 'placeholder')).toBe(false);
          expect(typeof $sortableElement.sortable('option', 'update')).toBe('function');

          element.remove(element.firstChild);

          expect(function() {
            $timeout.flush();
          }).not.toThrow();

        });

      });

      it('should not initialize a disabled sortable', function() {
        inject(function($compile, $rootScope) {
          var element;
          var childScope = $rootScope.$new();
          spyOn(angular.element.fn, 'sortable');

          childScope.items = ['One', 'Two', 'Three'];
          childScope.opts = {
            disabled: true
          };
          element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul>')(childScope);

          expect(angular.element.fn.sortable).not.toHaveBeenCalled();
        });
      });

      it('should lazily initialize a latelly enabled sortable (set disabled = false)', function() {
        inject(function($compile, $rootScope, $timeout) {
          var element;
          var childScope = $rootScope.$new();
          spyOn(angular.element.fn, 'sortable');

          childScope.items = ['One', 'Two', 'Three'];
          childScope.opts = {
            disabled: true
          };
          element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul>')(childScope);

          expect(angular.element.fn.sortable).not.toHaveBeenCalled();

          $rootScope.$apply(function() {
            childScope.opts.disabled = false;
          });

          expect(function() {
            $timeout.flush();
          }).not.toThrow();

          expect(angular.element.fn.sortable).toHaveBeenCalled();
        });
      });

      it('should lazily initialize a sortable enabled in $timeout (set disabled = false)', function() {
        inject(function($compile, $rootScope, $timeout) {
          var element;
          var childScope = $rootScope.$new();
          spyOn(angular.element.fn, 'sortable');

          childScope.items = ['One', 'Two', 'Three'];
          childScope.opts = {
            disabled: true
          };
          element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul>')(childScope);

          expect(angular.element.fn.sortable).not.toHaveBeenCalled();

          $timeout(function () {
            childScope.opts.disabled = false;
          });

          $timeout(function () {
            expect(angular.element.fn.sortable).toHaveBeenCalled();
          });

          expect(function() {
            $timeout.flush();
          }).not.toThrow();

        });
      });

      it('should lazily initialize a latelly enabled sortable (delete disabled option)', function() {
        inject(function($compile, $rootScope, $timeout) {
          var element;
          var childScope = $rootScope.$new();
          spyOn(angular.element.fn, 'sortable');

          childScope.items = ['One', 'Two', 'Three'];
          childScope.opts = {
            disabled: true
          };
          element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul>')(childScope);

          expect(angular.element.fn.sortable).not.toHaveBeenCalled();

          $rootScope.$apply(function() {
            childScope.opts = {};
          });

          expect(function() {
            $timeout.flush();
          }).not.toThrow();

          expect(angular.element.fn.sortable).toHaveBeenCalled();
        });
      });

      it('should lazily initialize a sortable enabled in $timeout (delete disabled option)', function() {
        inject(function($compile, $rootScope, $timeout) {
          var element;
          var childScope = $rootScope.$new();
          spyOn(angular.element.fn, 'sortable');

          childScope.items = ['One', 'Two', 'Three'];
          childScope.opts = {
            disabled: true
          };
          element = $compile('<ul ui-sortable="opts" ng-model="items"><li ng-repeat="item in items">{{ item }}</li></ul>')(childScope);

          expect(angular.element.fn.sortable).not.toHaveBeenCalled();

          expect(function() {
            $timeout.flush();
          }).not.toThrow();

          $timeout(function () {
            childScope.opts = {};
          });

          $timeout(function () {
            expect(angular.element.fn.sortable).toHaveBeenCalled();
          });

          expect(function() {
            $timeout.flush();
          }).not.toThrow();

        });
      });

    });


  });

});
