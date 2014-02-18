'use strict';

describe('uiSortable', function() {

  // Ensure the sortable angular module is loaded
  beforeEach(module('ui.sortable'));

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

});