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
    }
}).components;

let loop = neoan.component('loop',{
    template: `<ul data-for="iterates">
            <li><span>{{iterate.bu}}</span><button data-click="remove($i)">delete</button></li>
        </ul><button data-click="add">{{other}}</button><button data-click="delete">x</button><span>{{deeper.value}}</span>`,
    data:{
        iterates: [{bu:'test'},{bu:'second'}],
        other:'add',
        deeper:{
            value:'aha'
        }
    },
    loaded(){
        console.log(this.data);
    },
    updated(){

    },
    remove(){
        let neoanPath = [];
        this.event.path.forEach((e)=>{
            if(e instanceof HTMLElement &&e.dataset.id){
                neoanPath.push(e);
            }
        });
        console.log(neoanPath);
    },
    delete(){
        this.data.iterates.pop();
        // this.data.iterates.splice(this.data.iterates.length-1,1);
        // this.rendering();
    },
    add(){
        this.data.iterates.push({bu:'item-'+Math.random().toString(36).substring(7)});
    }
});

neoan.component('first-element', {
    template: `<input type="text" data-bind="some"><p><span>{{some}}</span>, <div data-click="someFunction"><span>{{another}}</span></div><my-button data-click="someFunction"></my-button></p>`,
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
        console.log(this.data.another);
    }
});


