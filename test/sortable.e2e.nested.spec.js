'use strict';

describe('uiSortable', function() {

  // Ensure the sortable angular module is loaded
  beforeEach(module('ui.sortable'));
  beforeEach(module('ui.sortable.testHelper'));
  
  var EXTRA_DY_PERCENTAGE, listInnerContent;

  beforeEach(inject(function (sortableTestHelper) {
    EXTRA_DY_PERCENTAGE = sortableTestHelper.EXTRA_DY_PERCENTAGE;
    listInnerContent = sortableTestHelper.listInnerContent;
  }));

  describe('Nested sortables related', function() {

    var host;

    beforeEach(inject(function() {
      host = $('<div id="test-host"></div>');
      $('body').append(host);
    }));

    afterEach(function() {
      host.remove();
      host = null;
    });

    it('should update model when sorting between nested sortables', function() {
      inject(function($compile, $rootScope) {
        var elementTree, li1, li2, dy;

        elementTree = $compile(''.concat(
          '<ul ui-sortable="sortableOptions" ng-model="items" class="apps-container outterList" style="float: left;margin-left: 10px;padding-bottom: 10px;">',
            '<li ng-repeat="item in items">',
              '<div>',
                '<span class="itemContent lvl1ItemContent">{{item.text}}</span>',
                '<ul ui-sortable="sortableOptions" ng-model="item.items" class="apps-container innerList" style="margin-left: 10px;padding-bottom: 10px;">',
                  '<li ng-repeat="i in item.items">',
                    '<span class="itemContent lvl2ItemContent">{{i.text}}</span>',
                  '</li>',
                '</ul>',
              '</div>',
            '</li>',
          '</ul>',
          '<div style="clear: both;"></div>'))($rootScope);

        $rootScope.$apply(function() {
          $rootScope.items = [
            {
              text: 'Item 1',
              items: []
            },
            {
              text: 'Item 2',
              items: [
                { text: 'Item 2.1', items: [] },
                { text: 'Item 2.2', items: [] }
              ]
            }
          ];
          
          $rootScope.sortableOptions = {
            connectWith: '.apps-container'
          };
        });

        host.append(elementTree);

        // this should drag the item out of the list and
        // the item should return back to its original position
        li1 = elementTree.find('.innerList:last').find(':last');
        li1.simulate('drag', { dx: -200, moves: 30 });
        expect($rootScope.items.map(function(x){ return x.text; }))
          .toEqual(['Item 1', 'Item 2']);
        expect($rootScope.items.map(function(x){ return x.text; }))
          .toEqual(listInnerContent(elementTree, '.lvl1ItemContent'));
        expect($rootScope.items[0].items.map(function(x){ return x.text; }))
          .toEqual([]);
        expect($rootScope.items[0].items.map(function(x){ return x.text; }))
          .toEqual(listInnerContent(elementTree.find('.innerList:eq(0)'), '.lvl2ItemContent'));
        expect($rootScope.items[1].items.map(function(x){ return x.text; }))
          .toEqual(['Item 2.1', 'Item 2.2']);
        expect($rootScope.items[1].items.map(function(x){ return x.text; }))
          .toEqual(listInnerContent(elementTree.find('.innerList:eq(1)'), '.lvl2ItemContent'));

        // this should drag the item from the inner list and
        // drop it to the outter list
        li1 = elementTree.find('.innerList:last').find(':last');
        li2 = elementTree.find('> li:last');
        dy = EXTRA_DY_PERCENTAGE * li1.outerHeight() + (li2.position().top - li1.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.items.map(function(x){ return x.text; }))
          .toEqual(['Item 1', 'Item 2.2', 'Item 2']);
        expect($rootScope.items.map(function(x){ return x.text; }))
          .toEqual(listInnerContent(elementTree, '.lvl1ItemContent'));
        expect($rootScope.items[0].items.map(function(x){ return x.text; }))
          .toEqual([]);
        expect($rootScope.items[0].items.map(function(x){ return x.text; }))
          .toEqual(listInnerContent(elementTree.find('.innerList:eq(0)'), '.lvl2ItemContent'));
        expect($rootScope.items[1].items.map(function(x){ return x.text; }))
          .toEqual([]);
        expect($rootScope.items[1].items.map(function(x){ return x.text; }))
          .toEqual(listInnerContent(elementTree.find('.innerList:eq(1)'), '.lvl2ItemContent'));
        expect($rootScope.items[2].items.map(function(x){ return x.text; }))
          .toEqual(['Item 2.1']);
        expect($rootScope.items[2].items.map(function(x){ return x.text; }))
          .toEqual(listInnerContent(elementTree.find('.innerList:eq(2)'), '.lvl2ItemContent'));

        // this should drag the item from the outter list and
        // drop it to the inner list
        li1 = elementTree.find('> li:first');
        li2 = elementTree.find('.innerList:last').find(':last');
        dy = -EXTRA_DY_PERCENTAGE * li1.outerHeight() + (li2.position().top - li1.position().top);
        li1.simulate('drag', { dy: dy });
        expect($rootScope.items.map(function(x){ return x.text; }))
          .toEqual(['Item 2.2', 'Item 2']);
        expect($rootScope.items.map(function(x){ return x.text; }))
          .toEqual(listInnerContent(elementTree, '.lvl1ItemContent'));
        expect($rootScope.items[0].items.map(function(x){ return x.text; }))
          .toEqual([]);
        expect($rootScope.items[0].items.map(function(x){ return x.text; }))
          .toEqual(listInnerContent(elementTree.find('.innerList:eq(0)'), '.lvl2ItemContent'));
        expect($rootScope.items[1].items.map(function(x){ return x.text; }))
          .toEqual(['Item 1', 'Item 2.1']);
        expect($rootScope.items[1].items.map(function(x){ return x.text; }))
          .toEqual(listInnerContent(elementTree.find('.innerList:eq(1)'), '.lvl2ItemContent'));

        $(elementTree).remove();
      });
    });

  });

});