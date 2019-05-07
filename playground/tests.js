import neoan from '../src/neoan.js';


let comp = neoan.component('my-button', {
    template: `<button>nested button executes parent's function</button>`,
    data:{
        key:'val'
    },
    loaded() {
        console.log('my button loaded');
        console.log(this.data);
        setTimeout(()=>this.data.update = true,1000);
    },
    updated(){
        console.log(this.data._parent);
    }
}).components;
console.log(comp);

let loop = neoan.component('loop',{
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
console.log(loop.components);

neoan.component('first-element', {
    template: `<input type="text" data-bind="some"><p>{{some}}, <span data-click="someFunction">{{another}}</span><my-button data-click="someFunction"></my-button></p>`,
    data: {
        some: 'coolio',
        another: 'foo',
        testing: {
            given:'value'
        }
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


