import neoan from "./neoan.js";
import helper from "./helper.js"
import onChange from './onchange.js';
import directives from './directives.js';

export default function Component(name, component = {}) {
    const blocked = ['data', 'template', 'loaded', 'updated', 'store'];
    let masterTemplate = null;
    const configuration = {
        data: {},
        template: null,
        loaded: () => {
        },
        updated: () => {
        },
        ...component
    };

    const elements = document.querySelectorAll(name);
    this.registeredIds = [];

    const methods = Object.keys(configuration)
    // .filter(k => !blocked.includes(k))
        .filter(k => helper.isFunction(configuration, k))
        .reduce((pV, cK) => ({...pV, [cK]: configuration[cK]}), {});
    const stateObj = Object.keys(configuration.data)
        .filter(k => !helper.isFunction(configuration.data, k))
        .reduce((pV, cK) => ({...pV, [cK]: configuration.data[cK]}), {});
    const stateArray = helper.objToFlatArray(stateObj);
    if (elements) {
        elements.forEach((element) => {
            if(element.hasAttribute('is-template')){
                masterTemplate = element.cloneNode(true);
                element.style.display = 'none';
            }
            let regId = helper.registerId('c');
            element.id = regId;
            this.registeredIds.push(regId);
            neoan.components[name].push(regId);
            if (component.template) {
                element.innerHTML = component.template;
            }
        });
        if(masterTemplate){
            elements.forEach((e)=>{e.innerHTML = masterTemplate.innerHTML});
        }
    }
    const bindings = {};

    const rerenderElement = function (el, s) {
        if(typeof bindings[s] === 'undefined'){
            bindings[s] = [];
        }
        let currentNode = null,nodes =[], binder = `{{${s}}}`;
        bindings[s].forEach((clone)=>{
            let cNode = el.querySelector('[data-id="'+clone.dataset.id+'"]');
            if(cNode !== null){
                cNode.innerHTML = clone.innerHTML.replace(new RegExp(binder, 'g'), helper.deepFlatten(s,stateObj));
            }
        });
        let xpath = "//*[contains(text(),'"+binder+"')]";
        let find = document.evaluate(xpath, el, null, XPathResult.ANY_TYPE, null);
        while(currentNode = find.iterateNext()){
            nodes.push(currentNode);
        }
        nodes.forEach((applyNode)=>{
            applyNode.dataset.id = helper.registerId('bind');
            bindings[s].push(applyNode.cloneNode(true));
            applyNode.innerHTML = applyNode.innerHTML.replace(new RegExp(binder, 'g'), helper.deepFlatten(s,stateObj));
        });
    };
    const rendering = function () {
        if (elements) {
            stateArray.forEach((x) => {
                elements.forEach((element) => {
                    rerenderElement(element, helper.firstObjectKey(x));
                    updateDirectives(element,helper.firstObjectKey(x),helper.deepFlatten(helper.firstObjectKey(x),stateObj));
                })
            });
        }
    };
    const updateDirectives = (el,n,val) => {
        directives.binder(el,n,val,context);
    };
    const data = onChange(stateObj, () => {
        rendering();
        setTimeout(() => configuration.updated.call(context));
    });
    const context = {...methods, elements, data, rendering};

    if (component.template) {
        let addToState = helper.embrace(component.template);
        addToState.forEach((match) => {
            if (typeof stateObj[match] === 'undefined') {
                stateObj[match] = '';
            }
        });

    }
    document.addEventListener('DOMContentLoaded', () => {
        rendering();
        configuration.loaded.call(context);
    });
}
