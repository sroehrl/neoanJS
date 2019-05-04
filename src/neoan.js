import Component from './component.js';

const Neoan =  function() {
    this.components = {};
    this.component = (name,opt = {}) => {
        this.components[name] = [];
        new Component(name,opt);
        return this;
    };
};
const neoan = new Neoan();
Object.freeze(neoan);
export default neoan;
