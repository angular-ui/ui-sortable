///<reference path="../typings/angular2/angular2.d.ts" />

import {ComponentAnnotation as Component, ViewAnnotation as View, bootstrap, NgIf} from 'angular2/angular2';

@Component({
    selector: 'hello'
})
@View({
    template: `<span *ng-if="name">Hello, {{name}}!</span>`,
    directives: [NgIf]
})
export class Hello {
    name: string = 'World';
    constructor() {
        setTimeout(() => {
          this.name = 'NEW World'
        }, 2000);
    }
}

bootstrap(Hello);
