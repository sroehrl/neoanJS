import Component from './component.js';
import Service from './service.js';
import helper from "./helper.js";
import directive from "./directive.js";

const Neoan =  function() {
    this.components = {};
    this.configurations = {};
    this.services = {};
    this.directives = [];

    this.directive = (name,opt={})=>{
        directive.register(name,opt);
        this.cycle();
        return this;

    };
    this.service = (name,opt) =>{
        new Service(name,opt);
    };
    this.component = (name,opt = {}) => {
        this.components[helper.kebabToCamel(name)] = [];
        new Component(name,opt);
        this.cycle();
        return this;
    };
    this.useNeoanDirectives = (argument)=>{
        if(Array.isArray(argument)){
            argument.forEach((directive)=>{
                import('./directives/'+directive+'.directive.js');
            })
        } else {
            import('./directives/'+argument+'.directive.js');
        }

    };
    this.cycle = function(){
        Object.keys(this.components).forEach((comp)=>{
            let rerender = false, tagName = helper.camelToKebab(comp);
            document.querySelectorAll(tagName).forEach((element)=>{
                // this.components
                if(!element.hasAttribute('id') || this.components[comp].filter((registered)=>{
                    return registered.id === element.id
                }).length<1){
                    rerender = true;
                }
            });
            if(rerender){
                new Component(tagName,this.configurations[comp]);
            }
        })
    };
};
const neoan = new Neoan();

Object.freeze(neoan);

export default neoan;
