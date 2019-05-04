import neoan from '../src/neoan.js';


let comp = neoan.component('my-button', {
    template: `<button>nested button executes parent's function</button>`,
    loaded() {
        console.log('my button loaded');
    }
}).components;
console.log(comp['my-button']);

neoan.component('loop',{
    template: `<ul data-for="iterates">
            <template>
                <li>{{iterate}}</li>
            </template>
            
        </ul><button data-click="add">PLUS</button>`,
    data:{
        iterates: ['a','b']
    },
    add(){
        this.data.iterates.push('item-'+this.data.iterates.length);
    }
});

neoan.component('first-element', {
    // template: `<input type="text" data-n="some"><p>{{some}}, <span data-click="someFunction">{{another.one}}</span></p>`,
    data: {
        some: 'coolio',
        another: 'foo',
        iterates: ['foo','bar']
    },
    loaded() {
        console.log(this);
    },
    updated() {

    },
    someFunction() {
        this.data.some = 'changed';
        this.data.iterates.push('item-'+this.data.iterates.length);
        this.data.another = this.data.another === 'bar' ? 'foo' :'bar';
    }
});


