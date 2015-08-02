///<reference path="../typings/angular2/angular2.d.ts" />

import {Component, View, bootstrap, NgIf, NgFor, forwardRef, Inject} from 'angular2/angular2';
import {UiSortableComponent} from 'sortable';

// Annotation section
@Component({
  selector: 'my-app',
})

@View({
    templateUrl: 'list.html',
    directives: [NgIf, NgFor, UiSortableComponent]
})

// Component controller
class UiSortablePlayComponent {

  items: Array<string>;
  sortableOptions: Object;

  constructor() {
    this.items = [
      'Item 1',
      'Item 2',
      'Item 3',
      'Item 4',
      'Item 5'
    ];

    var displayInstance = this;
    this.sortableOptions = {
      stop: function() {
        console.log(displayInstance.items);
      }
    };
  }

  addItem(name: string) {
    this.items.push(name);
  }

  doneTyping($event) {
     if ($event.which === 13) {
         this.addItem($event.target.value);
         $event.target.value = null;
     }
  }
}

bootstrap(UiSortablePlayComponent);
