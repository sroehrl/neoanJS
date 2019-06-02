import neoan from "./neoan.js";
import helper from "./helper.js";


const Directive = function(name, directive = {}) {

    this.listeners = {};
    this._memory = {};
    const elementIterator = (element, pattern) => {
        return element.querySelectorAll(pattern);
    };
    const provideWithId = (el, type) => {
        if (!el.dataset.id) {
            el.dataset.id = helper.registerId(type);
            return true;
        }
        return false;
    };
    this.checkListener = function (ele, type) {
        if (!ele.dataset.id) {
            provideWithId(ele, type);
        }
        if (typeof this.listeners[ele.dataset.id] === 'undefined') {
            this.listeners[ele.dataset.id] = [];
        }
        let res = this.listeners[ele.dataset.id].filter((s) => {
            return s.type === type
        }).length < 1;
        if (res) {
            this.listeners[ele.dataset.id].push({type: type, node: ele});
        }
        return res;
    };
    this.run = (element, scope, value, context) => {
        neoan.directives.forEach((dir) => {
            dir.directive.run(element, scope, value, context);
        });
    };

    this.register = (name ,directive ={})=>{
        if(neoan.directives.filter((registeredDirective)=>{
            return registeredDirective.name === name;
        }).length>0){
            return;
        }
        this._memory[name] = {};
        const activeDirective = {
            listeners:this.listeners,
            checkListener:this.checkListener,
            _memory:this._memory,
            elementIterator:elementIterator,
            run:()=>{}
        };
        Object.keys(directive).forEach((given)=>{
            activeDirective[given] = directive[given];
        });
        neoan.directives.push({name:name,directive:activeDirective});
    };

};

const directive = new Directive();
Object.freeze(directive);
export default directive;
