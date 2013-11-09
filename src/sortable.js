/*
 jQuery UI Sortable plugin wrapper

 @param [ui-sortable] {object} Options to pass to $.fn.sortable() merged onto ui.config
 */
angular.module('ui.sortable', [])
  .value('uiSortableConfig',{})
  .directive('uiSortable', [
    'uiSortableConfig', '$timeout', '$log',
    function(uiSortableConfig, $timeout, $log) {
      return {
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {
          var savedNodes;

          function combineCallbacks(first,second){
            if( second && (typeof second === "function") ){
              return function(e,ui){
                first(e,ui);
                second(e,ui);
              };
            }
            return first;
          }

          var opts = {};

          var callbacks = {
            receive: null,
            remove:null,
            start:null,
            stop:null,
            update:null
          };

          angular.extend(opts, uiSortableConfig);

          if (ngModel) {

            // When we add or remove elements, we need the sortable to 'refresh'
            scope.$watch(attrs.ngModel+'.length', function() {
              // Timeout to let ng-repeat modify the DOM
              $timeout(function() {
                element.sortable( "refresh" );
              });
            });

            callbacks.start = function(e, ui) {
              // Save position of dragged item
              ui.item.sortable = { index: ui.item.index() };

              // We need to make a copy of the current element's contents so
              // we can restore it after sortable has messed it up
              savedNodes = element.contents().not(
                //Don't inlcude the placeholder
                element.find("." + element.sortable('option','placeholder')
                             .element().attr('class').split(/\s+/).join('.')));
            };

            callbacks.update = function(e, ui) {
              // Save current drop position but only if this is not a second
              // update that happens when moving between lists because then
              // the value will be overwritten with the old value
              if(!ui.item.sortable.relocate){
                ui.item.sortable.dropindex = ui.item.index();
              }

              // Cancel the sort (let ng-repeat do the sort for us)
              element.sortable('cancel');

              // Put the nodes back exactly the way they started (this is very
              // important because ng-repeat uses comment elements to delineate
              // the start and stop of repeat sections and sortable doesn't
              // respect their order (even if we cancel, the order of the
              // comments are still messed up).
              savedNodes.detach().appendTo(element);

              // If relocate is true (an item was dropped in from another list)
              // then we add the new item to this list otherwise we move the
              // item to it's new location
              scope.$apply(function () {
                if(ui.item.sortable.relocate) {
                  ngModel.$modelValue.splice(ui.item.sortable.dropindex, 0,
                                             ui.item.sortable.moved);
                } else {
                  ngModel.$modelValue.splice(
                    ui.item.sortable.dropindex, 0,
                    ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0]);
                }
              });
            };

            callbacks.receive = function(e, ui) {
              // An item was dropped here from another list, set a flag
              ui.item.sortable.relocate = true;
            };

            callbacks.remove = function(e, ui) {
              // Remove the item from this list's model and copy data into item,
              // so the next list can retrive it
              scope.$apply(function () {
                ui.item.sortable.moved = ngModel.$modelValue.splice(
                  ui.item.sortable.index, 1)[0];
              });
            };

            scope.$watch(attrs.uiSortable, function(newVal, oldVal){
              angular.forEach(newVal, function(value, key){
                if( callbacks[key] ){
                  // wrap the callback
                  value = combineCallbacks( callbacks[key], value );
                }
                element.sortable('option', key, value);
              });
            }, true);

            angular.forEach(callbacks, function(value, key){
              opts[key] = combineCallbacks(value, opts[key]);
            });

          } else {
            $log.info('ui.sortable: ngModel not provided!', element);
          }

          // Create sortable
          element.sortable(opts);
        }
      };
    }
  ]);
