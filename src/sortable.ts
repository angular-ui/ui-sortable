///<reference path="../typings/angular2/angular2.d.ts" />
///<reference path="../typings/es6-promise/es6-promise.d.ts" />
////<reference path="../typings/jquery/jquery.d.ts" />
////<reference path="../typings/jqueryui/jqueryui.d.ts" />
//////<reference path="../typings/angular-ui2-sortable/angular-ui2-sortable.d.ts" />

import {
  Component, View, bootstrap, NgIf, NgFor, forwardRef, Inject,
  Directive, onCheck,
  ElementRef
} from 'angular2/angular2';
// import {formDirectives} from 'angular2/forms';
// import {Directive, onCheck} from 'angular2/angular2';
// import {ElementRef} from 'angular2/angular2';
// import {Renderer} from 'angular2/src/render/api';


@Directive({
  selector: '[ui-sortable]',
  // lifecycle: [onCheck],
  properties: ['uiSortable', 'ngModel']
})

export class UiSortableComponent {
  static uiSortableConfig = {
    // the default for jquery-ui sortable is "> *", we need to restrict this to
    // ng-repeat items
    // if the user uses
    items: '> *:not(template)'
  };

  static combineCallbacks(first, second) {
    var firstIsFunc = first && (typeof first === 'function');
    var secondIsFunc = second && (typeof second === 'function');
    if(firstIsFunc && secondIsFunc) {
      return function() {
        first.apply(this, arguments);
        second.apply(this, arguments);
      };
    } else if (secondIsFunc) {
      return second;
    }
    return first;
  }

  static getSortableWidgetInstance(element) {
    // this is a fix to support jquery-ui prior to v1.11.x
    // otherwise we should be using `element.sortable('instance')`
    var data = element.data('ui-sortable');
    if (data && typeof data === 'object' && data.widgetFullName === 'ui-sortable') {
      return data;
    }
    return null;
  }

  static getPlaceholderElement(element) {
    var placeholder = element.sortable('option','placeholder');

    // placeholder.element will be a function if the placeholder, has
    // been created (placeholder will be an object).  If it hasn't
    // been created, either placeholder will be false if no
    // placeholder class was given or placeholder.element will be
    // undefined if a class was given (placeholder will be a string)
    if (placeholder && placeholder.element && typeof placeholder.element === 'function') {
      var result = placeholder.element();
      // workaround for jquery ui 1.9.x,
      // not returning jquery collection
      result = $(result);
      return result;
    }
    return null;
  }

  static getPlaceholderExcludes(element, placeholder) {
    // exact match with the placeholder's class attribute to handle
    // the case that multiple connected sortables exist and
    // the placehoilder option equals the class of sortable items
    var excludes = element.find('[class="' + placeholder.attr('class') + '"]:not([ng-repeat], [data-ng-repeat])');
    return excludes;
  }

  static hasSortingHelper(element, ui) {
    var helperOption = element.sortable('option','helper');
    return helperOption === 'clone' || (typeof helperOption === 'function' && ui.item.sortable.isCustomHelperUsed());
  }

  static getSortingHelper(element, ui, savedNodes) {
    var result = null;
    if (UiSortableComponent.hasSortingHelper(element, ui) &&
        element.sortable( 'option', 'appendTo' ) === 'parent') {
      // The .ui-sortable-helper element (that's the default class name)
      // is placed last.
      result = savedNodes.last();
    }
    return result;
  }

  // thanks jquery-ui
  static isFloating(item) {
    return (/left|right/).test(item.css('float')) || (/inline|table-cell/).test(item.css('display'));
  }

  // return the index of ui.item among the items
  // we can't just do ui.item.index() because there it might have siblings
  // which are not items
  static getItemIndex(ui) {
    return ui.item.parent()
      .find(UiSortableComponent.uiSortableConfig.items)
      .index(ui.item);
  }

  // TODO
  static getElementInstance(elementScopes, element) {
    var result = null;
    for (var i = 0; i < elementScopes.length; i++) {
      var x = elementScopes[i];
      if (x.element[0] === element[0]) {
        result = x.instance;
        break;
      }
    }
    return result;
  }

  // thanks angular v1.4
  static equals(o1, o2) {
    var isArray = Array.isArray;
    function isDate(value) { return toString.call(value) === '[object Date]'; }
    function isFunction(value) { return typeof value === 'function'; }
    function isRegExp(value) { return toString.call(value) === '[object RegExp]'; }
    if (o1 === o2) return true;
    if (o1 === null || o2 === null) return false;
    if (o1 !== o1 && o2 !== o2) return true; // NaN === NaN
    var t1 = typeof o1, t2 = typeof o2, length, key, keySet;
    if (t1 == t2) {
      if (t1 == 'object') {
        if (isArray(o1)) {
          if (!isArray(o2)) return false;
          if ((length = o1.length) == o2.length) {
            for (key = 0; key < length; key++) {
              if (!UiSortableComponent.equals(o1[key], o2[key])) return false;
            }
            return true;
          }
        } else if (isDate(o1)) {
          if (!isDate(o2)) return false;
          return UiSortableComponent.equals(o1.getTime(), o2.getTime());
        } else if (isRegExp(o1)) {
          return isRegExp(o2) ? o1.toString() == o2.toString() : false;
        } else {
          keySet = {};
          for (key in o1) {
            if (key.charAt(0) === '$' || isFunction(o1[key])) continue;
            if (!UiSortableComponent.equals(o1[key], o2[key])) return false;
            keySet[key] = true;
          }
          for (key in o2) {
            if (!keySet.hasOwnProperty(key) &&
                key.charAt(0) !== '$' &&
                o2[key] !== undefined &&
                !isFunction(o2[key])) return false;
          }
          return true;
        }
      }
    }
    return false;
  }



  savedNodes: any;

  opts = {};

  // directive specific options
  directiveOpts = {
    'ui-floating': undefined
  };

  callbacks = {
    activate:null,
    receive: null,
    remove:null,
    start:null,
    stop:null,
    update:null
  };

  wrappers = {
    helper: null
  };

  element: any;
  $element: any;
  options: Object;
  model: Array<any>;

  optionsSetPromiseResolve: Function;
  modelSetPromiseResolve: Function;

  // We set this to true after the constructor,
  // the options & model setters and init have run
  isComponentReady = false;

  constructor(_ngEl: ElementRef) {
    this.element = $(_ngEl.nativeElement);
    if (!this.element || !this.element.length) {
      console.log('ui.sortable: could not retrieve element from ElementRef');
    }

    // console.log('ctor', this.ngModel, this.uiSortable);
    this.element.sortable();

    var optionsSetPromise = new Promise((resolve) => {
      this.optionsSetPromiseResolve = resolve;
    });

    var modelSetPromise = new Promise((resolve) => {
      this.modelSetPromiseResolve = resolve;
    });

    Promise.all([optionsSetPromise, modelSetPromise]).then(() => {
      this.optionsSetPromiseResolve = null;
      this.modelSetPromiseResolve = null;
      // console.log('Promise.all');
      this.init();
      this.isComponentReady = true;
    });

    // window.uiSortableComponent = window.uiSortableComponent || [];
    // window.uiSortableComponent.push({
    //   instance: this,
    //   element: this.element,
    //   elementRef: _ngEl
    // });
  }

  set uiSortable(options) {
    this.options = options;
    // console.log('set uiSortable', options);
    this.element.sortable('option', this.options);
    this.optionsSetPromiseResolve();
  }

  set ngModel(model) {
    // Any the model changes after the first time
    if (this.isComponentReady) {
      // When we add or remove elements, we need the sortable to 'refresh'
      // so it can find the new/removed elements.
      // Timeout to let ng-for modify the DOM
      setTimeout(() => {
        // ensure that the jquery-ui-sortable widget instance
        // is still bound to the directive's element
        if (!!UiSortableComponent.getSortableWidgetInstance(this.element)) {
          this.element.sortable('refresh');
        }
      }, 0);
    }
    this.model = model;
    // console.log('set ngModel', model);
    this.modelSetPromiseResolve();
  }

  init() {
    $.extend(this.opts, this.directiveOpts, UiSortableComponent.uiSortableConfig, this.options);

    if (!$.fn || !$.fn.jquery) {
      console.log('ui.sortable: jQuery should be included before AngularJS!');
      return;
    }

    if (this.model) {

      this.callbacks.start = (e, ui) => {
        if (this.opts['ui-floating'] === 'auto') {
          // since the drag has started, the element will be
          // absolutely positioned, so we check its siblings
          var siblings = ui.item.siblings();
          var sortableWidgetInstance = UiSortableComponent.getSortableWidgetInstance($(e.target));
          sortableWidgetInstance.floating = UiSortableComponent.isFloating(siblings);
        }

        // Save the starting position of dragged item
        var index = UiSortableComponent.getItemIndex(ui);
        ui.item.sortable = {
          model: this.model[index],
          index: index,
          source: ui.item.parent(),
          sourceModel: this.model,
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
            Object.keys(ui.item.sortable).forEach(function(key) {
              ui.item.sortable[key] = undefined;
            });
          }
        };
      };

      this.callbacks.activate = (e, ui) => {
        // We need to make a copy of the current element's contents so
        // we can restore it after sortable has messed it up.
        // This is inside activate (instead of start) in order to save
        // both lists when dragging between connected lists.
        this.savedNodes = this.element.contents();

        // If this list has a placeholder (the connected lists won't),
        // don't inlcude it in saved nodes.
        var placeholder = UiSortableComponent.getPlaceholderElement(this.element);
        if (placeholder && placeholder.length) {
          var excludes = UiSortableComponent.getPlaceholderExcludes(this.element, placeholder);
          this.savedNodes = this.savedNodes.not(excludes);
        }

        // save the directive's scope so that it is accessible from ui.item.sortable
        var connectedSortables = ui.item.sortable._connectedSortables || [];

        connectedSortables.push({
          element: this.element,
          instance: this
        });

        ui.item.sortable._connectedSortables = connectedSortables;
      };

      this.callbacks.update = (e, ui) => {
        // Save current drop position but only if this is not a second
        // update that happens when moving between lists because then
        // the value will be overwritten with the old value
        if(!ui.item.sortable.received) {
          ui.item.sortable.dropindex = UiSortableComponent.getItemIndex(ui);
          var droptarget = ui.item.parent();
          ui.item.sortable.droptarget = droptarget;

          var droptargetInstance = UiSortableComponent.getElementInstance(ui.item.sortable._connectedSortables, droptarget);
          ui.item.sortable.droptargetModel = droptargetInstance.model;

          // Cancel the sort (let ng-repeat do the sort for us)
          // Don't cancel if this is the received list because it has
          // already been canceled in the other list, and trying to cancel
          // here will mess up the DOM.
          this.element.sortable('cancel');
        }

        // Put the nodes back exactly the way they started (this is very
        // important because ng-repeat uses comment elements to delineate
        // the start and stop of repeat sections and sortable doesn't
        // respect their order (even if we cancel, the order of the
        // comments are still messed up).
        var sortingHelper = !ui.item.sortable.received && UiSortableComponent.getSortingHelper(this.element, ui, this.savedNodes);
        if (sortingHelper && sortingHelper.length) {
          // Restore all the savedNodes except from the sorting helper element.
          // That way it will be garbage collected.
          this.savedNodes = this.savedNodes.not(sortingHelper);
        }
        this.savedNodes.appendTo(this.element);

        // If this is the target connected list then
        // it's safe to clear the restored nodes since:
        // update is currently running and
        // stop is not called for the target list.
        if(ui.item.sortable.received) {
          this.savedNodes = null;
        }

        // If received is true (an item was dropped in from another list)
        // then we add the new item to this list otherwise wait until the
        // stop event where we will know if it was a sort or item was
        // moved here from another list
        if(ui.item.sortable.received && !ui.item.sortable.isCanceled()) {
          this.model.splice(ui.item.sortable.dropindex, 0,
                            ui.item.sortable.moved);
        }
      };

      this.callbacks.stop = (e, ui) => {
        // If the received flag hasn't be set on the item, this is a
        // normal sort, if dropindex is set, the item was moved, so move
        // the items in the list.
        if(!ui.item.sortable.received &&
           ('dropindex' in ui.item.sortable) &&
           !ui.item.sortable.isCanceled()) {

            this.model.splice(
              ui.item.sortable.dropindex, 0,
              this.model.splice(ui.item.sortable.index, 1)[0]);
        } else {
          // if the item was not moved, then restore the elements
          // so that the ngRepeat's comment are correct.
          if ((!('dropindex' in ui.item.sortable) || ui.item.sortable.isCanceled()) &&
              !UiSortableComponent.equals(this.element.contents(), this.savedNodes)) {

            var sortingHelper = UiSortableComponent.getSortingHelper(this.element, ui, this.savedNodes);
            if (sortingHelper && sortingHelper.length) {
              // Restore all the savedNodes except from the sorting helper element.
              // That way it will be garbage collected.
              this.savedNodes = this.savedNodes.not(sortingHelper);
            }
            this.savedNodes.appendTo(this.element);
          }
        }

        // It's now safe to clear the savedNodes
        // since stop is the last callback.
        this.savedNodes = null;
      };

      this.callbacks.receive = (e, ui) => {
        // An item was dropped here from another list, set a flag on the
        // item.
        ui.item.sortable.received = true;
      };

      this.callbacks.remove = (e, ui) => {
        // Workaround for a problem observed in nested connected lists.
        // There should be an 'update' event before 'remove' when moving
        // elements. If the event did not fire, cancel sorting.
        if (!('dropindex' in ui.item.sortable)) {
          this.element.sortable('cancel');
          ui.item.sortable.cancel();
        }

        // Remove the item from this list's model and copy data into item,
        // so the next list can retrive it
        if (!ui.item.sortable.isCanceled()) {
          ui.item.sortable.moved = this.model.splice(
            ui.item.sortable.index, 1)[0];
        }
      };

      this.wrappers.helper = function (inner) {
        if (inner && typeof inner === 'function') {
          return function (e, item) {
            var innerResult = inner.apply(this, arguments);
            item.sortable._isCustomHelperUsed = item !== innerResult;
            return innerResult;
          };
        }
        return inner;
      };

      // scope.$watchCollection('uiSortable', updateUiSortableOptions, true);

      this.patchUISortableOptions(this.opts);

    } else {
      console.info('ui.sortable: ngModel not provided!', this.element);
    }

    // Create sortable
    this.element.sortable(this.opts);
  }

  updateUiSortableOptions(newOptions, oldOptions) {
    // ensure that the jquery-ui-sortable widget instance
    // is still bound to the directive's element
    var sortableWidgetInstance = UiSortableComponent.getSortableWidgetInstance(this.element);
    if (!!sortableWidgetInstance) {
      var optsDiff = this.patchUISortableOptions(newOptions, oldOptions, sortableWidgetInstance);
      
      if (optsDiff) {
        this.element.sortable('option', optsDiff);
      }
    }
  }

  patchUISortableOptions(newOptions: Object, oldOptions: Object = undefined, sortableWidgetInstance: any = undefined) {
    var self = this;
    function addDummyOptionKey(key) {
      if (!(key in self.opts)) {
        // add the key in the opts object so that
        // the patch function detects and handles it
        self.opts[key] = null;
      }
    }
    // for this directive to work we have to attach some callbacks
    Object.keys(this.callbacks).forEach(addDummyOptionKey);

    // only initialize it in case we have to
    // update some options of the sortable
    var optsDiff = null;

    if (oldOptions) {
      // reset deleted options to default
      var defaultOptions;
      Object.keys(oldOptions).forEach((key) => {
        if (!newOptions || !(key in newOptions)) {
          if (key in this.directiveOpts) {
            this.opts[key] = 'auto';
            return;
          }

          if (!defaultOptions) {
            defaultOptions = $.ui.sortable().options;
          }
          var defaultValue = defaultOptions[key];
          defaultValue = this.patchSortableOption(key, defaultValue);

          if (!optsDiff) {
            optsDiff = {};
          }
          optsDiff[key] = defaultValue;
          this.opts[key] = defaultValue;
        }
      });
    }

    // update changed options
    Object.keys(newOptions).forEach((key) => {
      var value = newOptions[key];
      // if it's a custom option of the directive,
      // handle it approprietly
      if (key in this.directiveOpts) {
        if (key === 'ui-floating' && (value === false || value === true) && sortableWidgetInstance) {
          sortableWidgetInstance.floating = value;
        }

        this.opts[key] = value;
        return;
      }

      value = this.patchSortableOption(key, value);

      if (!optsDiff) {
        optsDiff = {};
      }
      optsDiff[key] = value;
      this.opts[key] = value;
    });

    return optsDiff;
  }

  patchSortableOption(key, value) {
    if (this.callbacks[key]) {
      if( key === 'stop' ){
        value = UiSortableComponent.combineCallbacks(value, this.afterStop);
      }
      // wrap the callback
      value = UiSortableComponent.combineCallbacks(this.callbacks[key], value);
    } else if (this.wrappers[key]) {
      value = this.wrappers[key](value);
    }

    if (key === 'items' && !value) {
      value = UiSortableComponent.uiSortableConfig.items;
    }

    return value;
  }

  afterStop(e, ui) {
    ui.item.sortable._destroy();
  }

}
