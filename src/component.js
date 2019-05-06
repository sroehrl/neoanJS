import neoan from "./neoan.js";
import helper from "./helper.js"
import onChange from './onchange.js';
import directives from './directives.js';
import renderer from './renderer.js';

export default function Component(name, component = {}) {
    const blocked = ['data', 'template', 'loaded', 'updated', 'store','name'];
    const slots = {};
    const proxies = {};
    const context = {};
    let masterTemplate = null;
    const configuration = {
        name:helper.kebabToCamel(name),
        data: {},
        template: null,
        loaded: () => {
        },
        updated: () => {
        },
    };
    Object.keys(component).forEach((given)=>{
        if(blocked.includes(given)){
            configuration[given] = component[given];
        } else {
            configuration[helper.kebabToCamel(name+'-'+given)] = component[given];
        }

    });
    /*TODO: add deeper dynamic objects*/
    const addToState = function(ele,id=false){
        if(ele instanceof HTMLElement){
            ele = ele.innerHTML;
        }
        let addToState = helper.embrace(ele);
        let binds = document.createRange().createContextualFragment(ele).querySelectorAll('[data-bind]');
        binds.forEach((bind)=>{
            addToState.push(bind.dataset.bind);
        });
        addToState.forEach((match) => {
            if (typeof stateObj[match] === 'undefined') {
                stateObj[match] = '';
            }
            if(id && typeof stateObjs[id][match] === 'undefined'){
                stateObjs[id][match] = '';
            }
        });

    };

    const rendering = function () {
        if (elements) {
            elements.forEach((element) => {
                stateArrays[element.id] = helper.objToFlatArray(stateObjs[element.id]);
                stateArrays[element.id].forEach((x)=>{
                    if (helper.filterTemplate(element)) {
                        updateDirectives(element, helper.firstObjectKey(x), helper.deepFlatten(helper.firstObjectKey(x), stateObjs[element.id]));
                        renderer.process(element, helper.firstObjectKey(x),helper.deepFlatten(helper.firstObjectKey(x), stateObjs[element.id]));
                    }
                })
            })
        }
    };
    const updateDirectives = (el, n, val) => {
        directives.binder(el, n, val, context[el.id],proxies);
    };

    const elements = document.querySelectorAll(name);
    this.registeredIds = [];

    const methods = Object.keys(configuration)
    // .filter(k => !blocked.includes(k))
        .filter(k => helper.isFunction(configuration, k))
        .reduce((pV, cK) => ({...pV, [cK]: configuration[cK]}), {});
    const stateObjs = {};
    let stateArrays = {};
    const stateObj = Object.keys(configuration.data)
        .filter(k => !helper.isFunction(configuration.data, k))
        .reduce((pV, cK) => ({...pV, [cK]: configuration.data[cK]}), {});
    let stateArray = helper.objToFlatArray(stateObj);

    const slotting = function(element,template,id=false){

        template = helper.slotEmbrace(template,slots);
        addToState(template,id);
        element.innerHTML = template;
    };

    if (elements) {
        elements.forEach((element) => {
            if (element.nodeType === 1) {
                if (element.hasAttribute('is-template')) {
                    masterTemplate = element.cloneNode(true);
                    addToState(element);
                    element.style.display = 'none';
                }
                if (element.hasAttribute('is-slot')) {
                    slots[element.getAttribute('is-slot')] = element.innerHTML;
                }
                let regId = helper.registerId(name);
                element.id = regId;
                stateObjs[regId] = Object.assign({}, stateObj);
                stateArrays[regId] = stateArray;
                this.registeredIds.push(regId);

                if (helper.filterTemplate(element)) {
                    proxies[element.id] = onChange(stateObjs[element.id], () => {
                        rendering();
                        setTimeout(() => configuration.updated.call(context[element.id]));
                    });
                    let data = proxies[element.id];
                    context[element.id] = {...methods, name, elements, data, rendering};
                    // neoan.components[helper.kebabToCamel(name)].push({...methods, name, elements, data, rendering});
                    neoan.components[helper.kebabToCamel(name)].push({
                        id:regId,
                        data:data,
                        ...methods
                    });
                }
            }

        });
        if (component.template) {
            elements.forEach((e)=>{
                slotting(e,component.template,e.id)
            })
        }
        // cleanup
        elements.forEach((e, i) => {
            if(e.hasAttribute('is-slot') || e.hasAttribute('is-template')){
                if(e.parentNode){
                    e.parentNode.removeChild(e);
                }
                delete elements[i];
            } else if(masterTemplate){
                slotting(e,masterTemplate.innerHTML,e.id)
            }
        });
    }


    const fireWhenDone = () => {
        rendering();
        let html = document.querySelector('html');
        html.style.visibility = 'visible';
        if (elements) {
            elements.forEach((e) => {
                if (helper.filterTemplate(e)) {
                    configuration.loaded.call(context[e.id]);
                }
            })
        }
    };

    document.removeEventListener('DOMContentLoaded', fireWhenDone);
    document.addEventListener('DOMContentLoaded', fireWhenDone);
}
