/*
 jQuery UI Sortable plugin wrapper

 @param [ui-sortable] {object} Options to pass to $.fn.sortable() merged onto ui.config
 */
angular.module('ui.sortable', [])
  .value('uiSortableConfig',{
    // the default for jquery-ui sortable is "> *", we need to restrict this to
    // ng-repeat items
    // if the user uses
    items: '> [ng-repeat],> [data-ng-repeat],> [x-ng-repeat]'
  })
  .directive('uiSortable', [
    'uiSortableConfig', '$timeout', '$log',
    function(uiSortableConfig, $timeout, $log) {
      return {
        require: '?ngModel',
        scope: {
          ngModel: '=',
          uiSortable: '='
        },
        link: function(scope, element, attrs, ngModel) {
          var savedNodes;

          function combineCallbacks(first, second){
            if (typeof second === 'function') {
              if (typeof first === 'function') {
                return function() {
                  first.apply(this, arguments);
                  second.apply(this, arguments);
                };
              }
              return second;
            }
            return first;
          }

          function getSortableWidgetInstance(element) {
            // this is a fix to support jquery-ui prior to v1.11.x
            // otherwise we should be using `element.sortable('instance')`
            var data = element.data('ui-sortable');
            if (data && typeof data === 'object' && data.widgetFullName === 'ui-sortable') {
              return data;
            }
          }

          function patchSortableOption(key, value) {
            if (callbacks[key]) {
              if( key === 'stop' ){
                value = combineCallbacks(value, function (e, ui) {
                  // call apply after stop
                  scope.$apply();
                  ui.item.sortable._destroy();
                });
              }
              // wrap the callback
              value = combineCallbacks(callbacks[key], value);
            } else if ( key === 'helper' && typeof value === 'function') {
              value = wrappersHelper(value);
            }

            // patch the options that need to have values set
            if (!value && (key === 'items' || key === 'ui-model-items')) {
              value = uiSortableConfig.items;
            }
            return value;
          }

          function patchUISortableOptions(newVal, oldVal, sortableWidgetInstance) {
            
            // for this directive to work we have to attach some callbacks
            angular.forEach(callbacks, function (value, key) {
              if (!opts[key]) {
                // add the key in the opts object so that
                // the patch function detects and handles it
                opts[key] = null;
              }
            });

            // initialize it in case we have to update some options of the sortable
            var optsDiff = {};

            // reset deleted options to default
            var defaultOptions = angular.element.ui.sortable().options;
            angular.forEach(oldVal, function(oldValue, key) {
              if (!newVal || !newVal[key]) {
                if (directiveOpts[key]) {
                  opts[key] = key === 'ui-floating' ? 'auto' : patchSortableOption(key);
                  return;
                }
                opts[key] = optsDiff[key] = patchSortableOption(key, defaultOptions[key]);
              }
            });
            

            // update changed options
            angular.forEach(newVal, function(value, key) {
              // if it's a custom option of the directive,
              // handle it approprietly
              if (directiveOpts[key]) {
                if (key === 'ui-floating' && (value === false || value === true) && sortableWidgetInstance) {
                  sortableWidgetInstance.floating = value;
                }
                opts[key] = patchSortableOption(key, value);
                return;
              }
              opts[key] = optsDiff[key] = patchSortableOption(key, value);
            });

            return optsDiff;
          }

          function getPlaceholderElement (element) {
            var placeholder = element.sortable('option','placeholder');

            // placeholder.element will be a function if the placeholder, has
            // been created (placeholder will be an object).  If it hasn't
            // been created, either placeholder will be false if no
            // placeholder class was given or placeholder.element will be
            // undefined if a class was given (placeholder will be a string)
            if (placeholder && placeholder.element && typeof placeholder.element === 'function') {
              // workaround for jquery ui 1.9.x, not returning jquery collection
              return angular.element(placeholder.element());
            }
          }

          function getPlaceholderExcludesludes (element, placeholder) {
            // exact match with the placeholder's class attribute to handle
            // the case that multiple connected sortables exist and
            // the placeholder option equals the class of sortable items
            var notCssSelector = opts['ui-model-items'].replace(/[^,]*>/g, '');
            return element.find('[class="' + placeholder.attr('class') + '"]:not(' + notCssSelector + ')');
          }

          function hasSortingHelper (element, ui) {
            var helperOption = element.sortable('option','helper');
            return helperOption === 'clone' || (typeof helperOption === 'function' && ui.item.sortable.isCustomHelperUsed());
          }

          function getSortingHelper (element, ui, savedNodes) {
            var result = null;
            if (hasSortingHelper(element, ui) && element.sortable( 'option', 'appendTo' ) === 'parent') {
              // The .ui-sortable-helper element (that's the default class name) is placed last.
              result = savedNodes.last();
            }
            return result;
          }

          // thanks jquery-ui
          function isFloating (item) {
            return (/left|right/).test(item.css('float')) || (/inline|table-cell/).test(item.css('display'));
          }

          function getElementScope(elementScopes, element) {
            for (var i = 0; i < elementScopes.length; i++) {
              var x = elementScopes[i];
              if (x.element[0] === element[0]) {
                return x.scope;
              }
            }
          }

          // return the index of ui.item among the items
          // we can't just do ui.item.index() because there it might have siblings
          // which are not items
          function getItemIndex(item) {
            return item.parent().find(opts['ui-model-items']).index(item);
          }

          var opts = {};

          // directive specific options
          var directiveOpts = {
            'ui-floating': undefined,
            'ui-model-items': uiSortableConfig.items
          };

          var callbacks = {
            receive: null,
            remove: null,
            start: null,
            stop: null,
            update: null
          };

          angular.extend(opts, directiveOpts, uiSortableConfig, scope.uiSortable);

          if (!angular.element.fn || !angular.element.fn.jquery) {
            $log.error('ui.sortable: jQuery should be included before AngularJS!');
            return;
          }

          function wireUp () {
            // When we add or remove elements, we need the sortable to 'refresh'
            // so it can find the new/removed elements.
            scope.$watchCollection('ngModel', function() {
              // Timeout to let ng-repeat modify the DOM
              $timeout(function() {
                // ensure that the jquery-ui-sortable widget instance
                // is still bound to the directive's element
                if (!!getSortableWidgetInstance(element)) {
                  element.sortable('refresh');
                }
              }, 0, false);
            });

            callbacks.start = function(e, ui) {
              if (opts['ui-floating'] === 'auto') {
                // since the drag has started, the element will be
                // absolutely positioned, so we check its siblings
                var siblings = ui.item.siblings();
                var sortableWidgetInstance = getSortableWidgetInstance(angular.element(e.target));
                sortableWidgetInstance.floating = isFloating(siblings);
              }

              // Save the starting position of dragged item
              var index = getItemIndex(ui.item);
              ui.item.sortable = {
                model: ngModel.$modelValue[index],
                index: index,
                source: ui.item.parent(),
                sourceModel: ngModel.$modelValue,
                cancel: function () {
                  ui.item.sortable._isCanceled = true;
                },
                isCanceled: function () {
                  return ui.item.sortable._isCanceled;
                },
                isCustomHelperUsed: function () {
                  return !!ui.item.sortable._isCustomHelperUsed;
                },
                _isCanceled: false,
                _isCustomHelperUsed: ui.item.sortable._isCustomHelperUsed,
                _destroy: function () {
                  delete ui.item.sortable;
                }
              };
            };

            callbacks.activate = function(e, ui) {
              // We need to make a copy of the current element's contents so
              // we can restore it after sortable has messed it up.
              // This is inside activate (instead of start) in order to save
              // both lists when dragging between connected lists.
              savedNodes = element.contents();

              // If this list has a placeholder (the connected lists won't),
              // don't inlcude it in saved nodes.
              var placeholder = getPlaceholderElement(element);
              if (placeholder && placeholder.length) {
                savedNodes = savedNodes.not(getPlaceholderExcludesludes(element, placeholder));
              }

              // save the directive's scope so that it is accessible from ui.item.sortable
              (ui.item.sortable._connectedSortables = ui.item.sortable._connectedSortables || []).push({
                element: element,
                scope: scope
              });
            };

            callbacks.update = function(e, ui) {
              // Save current drop position but only if this is not a second
              // update that happens when moving between lists because then
              // the value will be overwritten with the old value
              if(!ui.item.sortable.received) {
                ui.item.sortable.dropindex = getItemIndex(ui.item);
                var droptarget = ui.item.parent();
                ui.item.sortable.droptarget = droptarget;
                ui.item.sortable.droptargetModel = getElementScope(ui.item.sortable._connectedSortables, droptarget).ngModel;

                // Cancel the sort (let ng-repeat do the sort for us)
                // Don't cancel if this is the received list because it has
                // already been canceled in the other list, and trying to cancel
                // here will mess up the DOM.
                element.sortable('cancel');
              }

              // Put the nodes back exactly the way they started (this is very
              // important because ng-repeat uses comment elements to delineate
              // the start and stop of repeat sections and sortable doesn't
              // respect their order (even if we cancel, the order of the
              // comments are still messed up).
              var sortingHelper = !ui.item.sortable.received && getSortingHelper(element, ui, savedNodes);
              if (sortingHelper && sortingHelper.length) {
                // Restore all the savedNodes except from the sorting helper element.
                // That way it will be garbage collected.
                savedNodes = savedNodes.not(sortingHelper);
              }
              savedNodes.appendTo(element);

              // If this is the target connected list then
              // it's safe to clear the restored nodes since:
              // update is currently running and
              // stop is not called for the target list.
              if(ui.item.sortable.received) {
                savedNodes = null;
              }

              // If received is true (an item was dropped in from another list)
              // then we add the new item to this list otherwise wait until the
              // stop event where we will know if it was a sort or item was
              // moved here from another list
              if(ui.item.sortable.received && !ui.item.sortable.isCanceled()) {
                scope.$apply(function () {
                  ngModel.$modelValue.splice(ui.item.sortable.dropindex, 0, ui.item.sortable.moved);
                });
              }
            };

            callbacks.stop = function(e, ui) {
              // If the received flag hasn't be set on the item, this is a
              // normal sort, if dropindex is set, the item was moved, so move
              // the items in the list.
              if(!ui.item.sortable.received && ui.item.sortable.dropindex && !ui.item.sortable.isCanceled()) {
                scope.$apply(function () {
                  ngModel.$modelValue.splice(
                    ui.item.sortable.dropindex, 0,
                    ngModel.$modelValue.splice(ui.item.sortable.index, 1)[0]);
                });
              } else {
                // if the item was not moved, then restore the elements
                // so that the ngRepeat's comment are correct.
                if ((!ui.item.sortable.dropindex || ui.item.sortable.isCanceled()) &&
                    !angular.equals(element.contents(), savedNodes)) {

                  var sortingHelper = getSortingHelper(element, ui, savedNodes);
                  if (sortingHelper && sortingHelper.length) {
                    // Restore all the savedNodes except from the sorting helper element.
                    // That way it will be garbage collected.
                    savedNodes = savedNodes.not(sortingHelper);
                  }
                  savedNodes.appendTo(element);
                }
              }

              // It's now safe to clear the savedNodes
              // since stop is the last callback.
              savedNodes = null;
            };

            callbacks.receive = function(e, ui) {
              // An item was dropped here from another list, set a flag on the
              // item.
              ui.item.sortable.received = true;
            };

            callbacks.remove = function(e, ui) {
              // Workaround for a problem observed in nested connected lists.
              // There should be an 'update' event before 'remove' when moving
              // elements. If the event did not fire, cancel sorting.
              if (!ui.item.sortable.dropindex) {
                element.sortable('cancel');
                ui.item.sortable.cancel();
              }

              // Remove the item from this list's model and copy data into item,
              // so the next list can retrive it
              if (!ui.item.sortable.isCanceled()) {
                scope.$apply(function () {
                  ui.item.sortable.moved = ngModel.$modelValue.splice(
                    ui.item.sortable.index, 1)[0];
                });
              }
            };

            function wrappersHelper(inner) {
              return function (e, item) {
                var oldItemSortable = item.sortable;
                var index = getItemIndex(item);
                item.sortable = {
                  model: ngModel.$modelValue[index],
                  index: index,
                  source: item.parent(),
                  sourceModel: ngModel.$modelValue,
                  _restore: function () {
                    delete item.sortable;
                    item.sortable = oldItemSortable;
                  }
                };
              
                var innerResult = inner.apply(this, arguments);
                item.sortable._restore();
                item.sortable._isCustomHelperUsed = item !== innerResult;
                return innerResult;
              };
            };

            scope.$watchCollection('uiSortable', function(newVal, oldVal) {
              // ensure that the jquery-ui-sortable widget instance
              // is still bound to the directive's element
              var sortableWidgetInstance = getSortableWidgetInstance(element);
              if (!!sortableWidgetInstance) {
                var optsDiff = patchUISortableOptions(newVal, oldVal, sortableWidgetInstance);
                if (optsDiff) {
                  element.sortable('option', optsDiff);
                }
              }
            }, true);

            patchUISortableOptions(opts);
          }

          function init () {
            if (ngModel) {
              wireUp();
            } else {
              $log.info('ui.sortable: ngModel not provided!', element);
            }
            // Create sortable
            element.sortable(opts);
          }

          var cancelWatcher = scope.$watch('uiSortable.disabled', function (disabled) {
            if (!disabled) {
              cancelWatcher();
              init();
            }
          });
        }
      };
    }
  ]);
