import Component from './component.js';
import helper from "./helper.js";

const Neoan =  function() {
    this.components = {};
    this.configurations = {};
    this.component = (name,opt = {}) => {
        this.components[helper.kebabToCamel(name)] = [];
        new Component(name,opt);
        this.cycle();
        return this;
    };
    this.cycle = function(){
        console.log(this.components);
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
    }
};
const neoan = new Neoan();
Object.freeze(neoan);
export default neoan;
