import neoan from '../src/neoan.js';
let comp = neoan.component('my-button', {
    template: `<button>nested button executes parent's function</button>`,
    loaded() {
        console.log('my button loaded');
    }
}).components;
console.log(comp['my-button']);

neoan.component('first-element', {
    // template: `<input type="text" data-n="some"><p>{{some}}, <span data-click="someFunction">{{another.one}}</span></p>`,
    data: {
        some: 'coolio',
        another: 'foo',
        iterate: ['foo','bar']
    },
    loaded() {
        console.log(this.data);
    },
    updated() {
        // trigger on update
    },
    someFunction() {
        this.data.another = this.data.another === 'bar' ? 'foo' :'bar';
    }
});


