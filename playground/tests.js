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
            <li>{{iterate.bu}}</li>
        </ul><button data-click="add">{{other}}</button><button data-click="delete">x</button>`,
    data:{
        iterates: [{bu:'test'},{bu:'second'}],
        other:'add'
    },
    updated(){

    },
    delete(){
        this.data.iterates.splice(this.data.iterates.length-2,1);
        this.rendering();
    },
    add(){
        this.data.iterates.push({bu:'item-'+Math.random().toString(36).substring(7)});
    }
});

neoan.component('first-element', {
    // template: `<input type="text" data-n="some"><p>{{some}}, <span data-click="someFunction">{{another.one}}</span></p>`,
    data: {
        some: 'coolio',
        another: 'foo',
    },
    loaded() {
        console.log(this);
    },
    updated() {

    },
    someFunction() {
        this.data.some = 'changed';
        this.data.another = this.data.another === 'bar' ? 'foo' :'bar';
    }
});


