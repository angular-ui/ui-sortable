# ui.item.sortable API documentation

## Properties

**Note:**
The properties of `ui.item.sortable` object are cleared right after the stop callback fires. If you need to access them after the sorting ends, you should keep references in separate variables in your code.

### dropindex
Type: [Integer](http://api.jquery.com/Types/#Integer)  
Holds the index of the drop target that the dragged item was dropped.


### droptarget
Type: [jQuery](http://api.jquery.com/Types/#jQuery)  
Holds the ui-sortable element that the dragged item was dropped on.

### droptargetModel
Type: [Array](http://api.jquery.com/Types/#Array)  
Holds the array that is specified by the `ng-model` attribute of the [`droptarget`](#droptarget) ui-sortable element.

### index
Type: [Integer](http://api.jquery.com/Types/#Integer)  
Holds the original index of the item dragged.

### model
Type: [Object](http://api.jquery.com/Types/#Object)  
Holds the JavaScript object that is used as the model of the dragged item, as specified by the ng-repeat of the [`source`](#source) ui-sortable element and the item's [`index`](#index).

### moved
Type: [Object](http://api.jquery.com/Types/#Object)/`undefined`  
Holds the model of the dragged item only when a sorting happens between two connected ui-sortable elements.  
In other words: `'moved' in ui.item.sortable` will return false only when a sorting is withing the same ui-sortable element ([`source`](#source) equals to the [`droptarget`](#droptarget)).

### received
Type: [Boolean](http://api.jquery.com/Types/#Boolean)  
When sorting between two connected sortables, it will be set to true inside the `update` callback of the [`droptarget`](#droptarget).

### source
Type: [jQuery](http://api.jquery.com/Types/#jQuery)  
Holds the ui-sortable element that the dragged item originated from.

### sourceModel
Type: [Array](http://api.jquery.com/Types/#Array)  
Holds the array that is specified by the `ng-model` of the [`source`](#source) ui-sortable element.


## Methods

### cancel[()](http://api.jquery.com/Types/#Function)
Returns: Nothing  
Can be called inside the `update` callback, in order to prevent/revert a sorting.  
Should be used instead of the [jquery-ui-sortable cancel()](http://api.jqueryui.com/sortable/#method-cancel) method.

### isCanceled[()](http://api.jquery.com/Types/#Function)
Returns: [Boolean](http://api.jquery.com/Types/#Boolean)  
Returns whether the current sorting is marked as canceled, by an earlier call to [`ui.item.sortable.cancel()`](#cancel).

### isCustomHelperUsed[()](http://api.jquery.com/Types/#Function)
Returns: [Boolean](http://api.jquery.com/Types/#Boolean)  
Returns whether the [`helper`](http://api.jqueryui.com/sortable/#option-helper) element used for the current sorting, is one of the original ui-sortable list elements.
