describe('uiSortable', function() {

  // Ensure the sortable angular module is loaded
  beforeEach(module('ui.sortable'));

  describe('simple use', function() {

    it('should have a ui-sortable class', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile("<ul ui-sortable></ul>")($rootScope);
        expect(element.hasClass("ui-sortable")).toBeTruthy();
      });
    });

    it('should update model when order changes', function() {
      inject(function($compile, $rootScope) {
        var element;
        element = $compile('<ul ui-sortable ng-model="items"><li ng-repeat="item in items" id="s-{{$index}}">{{ item }}</li></ul>')($rootScope);
        $rootScope.$apply(function() {
          return $rootScope.items = ["One", "Two", "Three"];
        });

        element.find('li:eq(1)').insertAfter(element.find('li:eq(2)'));

        $('body').append(element);
        var li = element.find(':eq(1)');
        var dy = 1.25 * li.outerHeight();
        li.simulate('drag', { dx: 0, dy: dy });

        expect($rootScope.items).toEqual(["One", "Three", "Two"]);
        $(element).remove();
      });
    });

  });

});