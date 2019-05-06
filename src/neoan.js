import Component from './component.js';
import helper from "./helper.js";

const Neoan =  function() {
    this.components = {};
    this.component = (name,opt = {}) => {
        this.components[helper.kebabToCamel(name)] = [];
        new Component(name,opt);
        return this;
    };
};
const neoan = new Neoan();
Object.freeze(neoan);
export default neoan;
