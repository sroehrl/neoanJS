import neoan from "./main.js";
import helper from "./helper.js"
import onChange from './onchange.js';
export default function Component(name,opt = {}){
    const blocked = ['data', 'template', 'render', 'update','store'];
    const configuration = {
        data: {},
        template:null,
        render: ()=>{},
        update: ()=>{},
        ...opt
    };
    this.registeredId = 'neoan-c-'+ Math.random().toString(36).substring(7);
    let element = document.querySelector(name);
    if(element){
        element.id = this.registeredId;
        neoan.components[name] = this.registeredId;
        if(opt.template){
            element.innerHTML = opt.template;
        }
    }
    const methods = Object.keys(configuration)
        // .filter(k => !blocked.includes(k))
        .filter(k => helper.isFunction(configuration, k))
        .reduce((pV, cK) => ({ ...pV, [cK]: configuration[cK] }), {});
    const stateObj = Object.keys(configuration.data)
        .filter(k => !helper.isFunction(configuration.data, k))
        .reduce((pV, cK) => ({ ...pV, [cK]: configuration.data[cK] }), {});
    const stateArray = Object.keys(configuration.data)
        .filter(k => helper.isFunction(configuration.data, k))
        .map(k => helper.computeState(k, configuration.data[k]));

    const rendering = function(){
        Object.keys(stateObj).forEach((x)=>{
            console.log(stateArray);
            element.innerHTML = element.innerHTML.replace('{{'+x+'}}',stateObj[x]);
        });
    };
    const updateState = state => stateArray.forEach(s => s(state));
    const data = onChange(stateObj, () => {
        updateState(stateObj);
        rendering();
    });
    const context = { ...methods, element, data, rendering};
    let addToState = helper.embrace(opt.template);

    if(opt.template){
        addToState.forEach((match)=>{
            if(typeof stateObj[match] === 'undefined'){
                stateObj[match] = '';
            }
        });
        let element = document.querySelector(name);
        if(element){
            element.innerHTML = opt.template;
            neoan.components[name] = this.registeredId;
        }
        rendering();
    }
    document.addEventListener('DOMContentLoaded', () => {
        // updateComputedState(state); // Make sure computed state are available
        // render(false); // initial rendering
        configuration.render.call(context); // lifecycle: created
    });
}
